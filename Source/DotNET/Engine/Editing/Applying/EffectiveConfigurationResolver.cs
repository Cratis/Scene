// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Works out what each exposed component ends up with once what each instance in the chain contributed is applied: the owner's
/// values, then each template's and the scope's, in turn.
/// </summary>
static class EffectiveConfigurationResolver
{
    /// <summary>
    /// Resolves the effective configuration of a chain.
    /// </summary>
    /// <param name="chain">The chain.</param>
    /// <param name="instanceContributions">What the instances contributed.</param>
    /// <param name="catalog">The descriptors that say what the components have.</param>
    /// <returns>The effective configuration, with a diagnostic for every saved value that no longer fits; those are kept and apply again when they fit.</returns>
    public static EffectiveConfiguration Resolve(TemplateChain chain, IReadOnlyList<InstanceContribution> instanceContributions, DescriptorCatalog catalog)
    {
        var grants = ExposureGrants.Compute(chain, catalog);
        var diagnostics = new List<SceneDiagnostic>([.. chain.Diagnostics, .. grants.Diagnostics]);
        var handled = new HashSet<InstanceContribution>(ReferenceEqualityComparer.Instance);
        var components = new List<ComponentState>();

        foreach (var grant in grants.Exposed)
        {
            var owner = chain.Levels[grant.OwnerLevel];
            var element = owner.Elements.First(candidate => Data.Text(candidate, "id") == grant.Component);
            var configuration = components.FirstOrDefault(candidate => candidate.Component == grant.Component);
            if (configuration is null)
            {
                configuration = new ComponentState(grant.Component, owner.Owner, (JsonObject)(Data.Clone(Data.Get(element, "properties")) ?? new JsonObject()));
                components.Add(configuration);
            }

            var storedProperties = Data.Get(element, "properties") as JsonObject;
            var hasStored = storedProperties is not null && Data.TryGetValueAtPath(storedProperties, grant.Path, out _);
            var stored = hasStored ? Data.GetValueAtPath(storedProperties!, grant.Path) : null;
            var baseValue = hasStored ? Data.Clone(stored) : Data.FromElement(grant.Descriptor.Default);
            var hasValue = hasStored || grant.Descriptor.Default is not null;
            var isCollection = grant.Descriptor.ValueType == PropertyValueType.Collection;
            var baseItems = isCollection && baseValue is JsonArray baseList ? baseList.Select(ToEffectiveItem).ToList() : [];
            var items = new List<EffectiveCollectionItem>(baseItems);
            var current = new ValueState(hasStored ? ValueSource.Local : ValueSource.Default) { Value = baseValue, InheritedValue = Data.Clone(baseValue) };
            var contributed = false;

            for (var index = grant.OwnerLevel + 1; index < chain.Levels.Count; index++)
            {
                var instance = chain.Levels[index].Instance;
                if (!grants.ByInstance.TryGetValue(instance, out var byKey) || !byKey.TryGetValue(ExposureGrants.Key(grant.Component, grant.Path), out var effectiveGrant))
                {
                    continue;
                }

                var matching = instanceContributions.Where(contribution =>
                    contribution.Instance == instance && contribution.Component == grant.Component && contribution.Path == grant.Path).ToList();
                foreach (var contribution in matching)
                {
                    handled.Add(contribution);
                }

                if (isCollection)
                {
                    if (CollectionValue(effectiveGrant, matching, instance, items, diagnostics))
                    {
                        contributed = true;
                        current.ContributedBy = instance;
                    }
                }
                else
                {
                    hasValue |= ScalarValue(effectiveGrant, matching, instance, current, diagnostics);
                }
            }

            var maximumItems = grant.Descriptor.Constraints?.MaximumItems;
            if (isCollection && maximumItems is { } maximum && items.Count > maximum)
            {
                var dropped = items[maximum..];
                items.RemoveRange(maximum, items.Count - maximum);
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.ContributionTypeMismatch,
                    $"'{grant.Path}' on '{grant.Component}' allows at most {maximum} items; {string.Join(", ", dropped.Select(item => $"'{item.Id}'"))} {(dropped.Count == 1 ? "is" : "are")} ignored and kept.",
                    instance: current.ContributedBy ?? owner.Instance,
                    component: grant.Component,
                    path: grant.Path));
            }

            if (isCollection)
            {
                current.Items = items;
                current.InheritedValue = new JsonArray([.. baseItems.Select(ToFlatItem)]);
                current.Value = new JsonArray([.. items.Select(ToFlatItem)]);
                hasValue = true;
                if (contributed)
                {
                    current.Source = ValueSource.Instance;
                }
            }

            if (hasValue)
            {
                Data.SetValueAtPath(configuration.Properties, grant.Path, Data.Clone(current.Value));
            }

            configuration.Values.Add(new EffectivePropertyValue(
                grant.Path,
                Data.ToElement(current.Value),
                current.Source,
                Data.ToElement(current.InheritedValue),
                current.ContributedBy,
                current.Items));
        }

        var levelOf = new Dictionary<string, int>(StringComparer.Ordinal);
        for (var index = 0; index < chain.Levels.Count; index++)
        {
            levelOf[chain.Levels[index].Instance] = index;
        }

        foreach (var contribution in instanceContributions)
        {
            if (!levelOf.TryGetValue(contribution.Instance, out var contributorLevel) || handled.Contains(contribution))
            {
                continue;
            }

            var owner = chain.Levels.Take(contributorLevel).FirstOrDefault(chainLevel => chainLevel.Elements.Any(element => Data.Text(element, "id") == contribution.Component));
            if (owner is null)
            {
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.ContributionTargetMissing,
                    $"'{contribution.Instance}' has saved values for '{contribution.Component}', which is not in any layout or template above it. They are kept.",
                    instance: contribution.Instance,
                    component: contribution.Component,
                    path: contribution.Path));
            }
            else if (catalog.FindComponent(Data.Text(owner.Elements.First(element => Data.Text(element, "id") == contribution.Component), "componentName")!) is null)
            {
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.MissingComponentDescriptor,
                    $"'{contribution.Instance}' has saved values for '{contribution.Component}', but nothing describes that component any more. They are kept.",
                    instance: contribution.Instance,
                    component: contribution.Component,
                    path: contribution.Path));
            }
            else
            {
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.ContributionNotExposed,
                    $"'{contribution.Instance}' has a saved value for '{contribution.Path}' on '{contribution.Component}', which is not exposed to it. It is ignored and kept.",
                    instance: contribution.Instance,
                    component: contribution.Component,
                    path: contribution.Path));
            }
        }

        return new EffectiveConfiguration(
            [.. components.Select(state => new EffectiveComponentConfiguration(
                state.Component,
                state.Owner,
                state.Properties.ToDictionary(entry => entry.Key, entry => Data.ToElementOrNull(entry.Value)),
                state.Values))],
            diagnostics);
    }

    /// <summary>
    /// Writes an item the way it is stored: its id and then its fields.
    /// </summary>
    /// <param name="item">The item.</param>
    /// <returns>The flat item.</returns>
    public static JsonObject ToFlatItem(EffectiveCollectionItem item)
    {
        var flat = new JsonObject { ["id"] = item.Id };
        foreach (var (field, value) in item.Values)
        {
            flat[field] = Data.FromElement(value);
        }

        return flat;
    }

    static EffectiveCollectionItem ToEffectiveItem(JsonNode? item, int index)
    {
        var values = new Dictionary<string, JsonElement>(StringComparer.Ordinal);
        string? id = null;
        if (item is JsonObject record)
        {
            foreach (var (name, value) in record)
            {
                if (name == "id")
                {
                    id = Data.AsText(value);
                }
                else
                {
                    values[name] = Data.ToElementOrNull(value);
                }
            }
        }

        return new(string.IsNullOrEmpty(id) ? $"owner-{index}" : id, values, "owner", true);
    }

    static bool ScalarValue(ExposureGrant grant, List<InstanceContribution> matching, string instance, ValueState current, List<SceneDiagnostic> diagnostics)
    {
        var applied = false;
        foreach (var contribution in matching)
        {
            var value = Data.FromElement(contribution.Value);
            var problem = contribution.Value is null ? "a value is required" : ValueValidator.Validate(grant.Descriptor, value);
            if (problem is not null)
            {
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.ContributionTypeMismatch,
                    $"The saved value of '{grant.Path}' set by '{instance}' is ignored: {problem}. It is kept, and applies again when it fits.",
                    instance: instance,
                    component: grant.Component,
                    path: grant.Path));
                continue;
            }

            current.Value = value;
            current.Source = ValueSource.Instance;
            current.ContributedBy = instance;
            applied = true;
        }

        return applied;
    }

    static bool CollectionValue(ExposureGrant grant, List<InstanceContribution> matching, string instance, List<EffectiveCollectionItem> items, List<SceneDiagnostic> diagnostics)
    {
        var contributed = false;
        foreach (var contribution in matching)
        {
            if (contribution.Items is null)
            {
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.ContributionTypeMismatch,
                    $"The saved value of '{grant.Path}' set by '{instance}' is ignored: a collection takes items.",
                    instance: instance,
                    component: grant.Component,
                    path: grant.Path));
                continue;
            }

            if (contribution.ReplaceOwnerItems == true)
            {
                if (!grant.Operations.Contains(CollectionOperation.Replace))
                {
                    diagnostics.Add(Finding.Error(
                        DiagnosticCode.ContributionOperationNotPermitted,
                        $"'{instance}' replaces the items it inherits in '{grant.Path}', but replacing items is not exposed. It is ignored and kept.",
                        instance: instance,
                        component: grant.Component,
                        path: grant.Path));
                    continue;
                }

                items.Clear();
                contributed = true;
            }

            if (contribution.Items.Count > 0 && !grant.Operations.Contains(CollectionOperation.Add))
            {
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.ContributionOperationNotPermitted,
                    $"'{instance}' has items in '{grant.Path}', but adding items is not exposed. They are ignored and kept.",
                    instance: instance,
                    component: grant.Component,
                    path: grant.Path));
                continue;
            }

            foreach (var item in contribution.Items)
            {
                if (items.Exists(existing => existing.Id == item.Id))
                {
                    diagnostics.Add(Finding.Error(
                        DiagnosticCode.DuplicateCollectionItem,
                        $"The item id '{item.Id}' in '{grant.Path}' is already used.",
                        instance: instance,
                        component: grant.Component,
                        path: grant.Path,
                        itemId: item.Id));
                    continue;
                }

                var values = new Dictionary<string, JsonElement>(StringComparer.Ordinal);
                foreach (var (field, value) in item.Values)
                {
                    if (grant.EditableFields?.Contains(field) == false)
                    {
                        diagnostics.Add(Finding.Error(
                            DiagnosticCode.ContributionOperationNotPermitted,
                            $"The field '{field}' of '{grant.Path}' is not exposed for editing.",
                            instance: instance,
                            component: grant.Component,
                            path: grant.Path,
                            itemId: item.Id));
                        continue;
                    }

                    var single = new JsonObject { [field] = Data.FromElement(value) };
                    var problem = ValueValidator.ValidateItemValues(grant.Descriptor.Item, single).FirstOrDefault(candidate => candidate.Field == field);
                    if (problem is not null)
                    {
                        diagnostics.Add(Finding.Error(
                            problem.Problem.StartsWith("is not a field", StringComparison.Ordinal) ? DiagnosticCode.UnknownCollectionField : DiagnosticCode.ContributionTypeMismatch,
                            $"The field '{field}' of an item in '{grant.Path}' is ignored: {problem.Problem}.",
                            instance: instance,
                            component: grant.Component,
                            path: grant.Path,
                            itemId: item.Id));
                        continue;
                    }

                    values[field] = value;
                }

                items.Add(new(item.Id, values, instance, false));
                contributed = true;
            }
        }

        return contributed;
    }

    sealed class ComponentState(string component, string owner, JsonObject properties)
    {
        public string Component { get; } = component;

        public string Owner { get; } = owner;

        public JsonObject Properties { get; } = properties;

        public List<EffectivePropertyValue> Values { get; } = [];
    }

    sealed class ValueState(ValueSource source)
    {
        public JsonNode? Value { get; set; }

        public ValueSource Source { get; set; } = source;

        public JsonNode? InheritedValue { get; set; }

        public string? ContributedBy { get; set; }

        public List<EffectiveCollectionItem>? Items { get; set; }
    }
}
