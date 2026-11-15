// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// What every owner in a chain exposes, and what each instance in the chain may therefore configure.
/// </summary>
sealed class ExposureGrants
{
    /// <summary>
    /// Gets every exposure that resolved.
    /// </summary>
    public List<ExposureGrant> Exposed { get; } = [];

    /// <summary>
    /// Gets, by instance, what it may configure, by <see cref="Key"/>.
    /// </summary>
    public Dictionary<string, Dictionary<string, ExposureGrant>> ByInstance { get; } = [with(StringComparer.Ordinal)];

    /// <summary>
    /// Gets what was found while working it out.
    /// </summary>
    public List<SceneDiagnostic> Diagnostics { get; } = [];

    /// <summary>
    /// Gets the key a grant is looked up by.
    /// </summary>
    /// <param name="component">The id of the component.</param>
    /// <param name="path">The path of the property.</param>
    /// <returns>The key.</returns>
    public static string Key(string component, string path) => $"{component}\0{path}";

    /// <summary>
    /// Works out what each instance in a chain may configure. An owner's exposure reaches every level inside it, until a level
    /// re-exposes it, which can only narrow what the owner granted.
    /// </summary>
    /// <param name="chain">The chain.</param>
    /// <param name="catalog">The descriptors that say what the components have.</param>
    /// <returns>The grants.</returns>
    public static ExposureGrants Compute(TemplateChain chain, DescriptorCatalog catalog)
    {
        var result = new ExposureGrants();
        foreach (var chainLevel in chain.Levels)
        {
            result.ByInstance[chainLevel.Instance] = [with(StringComparer.Ordinal)];
        }

        var consumed = new HashSet<ExposedProperty>(ReferenceEqualityComparer.Instance);
        for (var ownerLevel = 0; ownerLevel < chain.Levels.Count; ownerLevel++)
        {
            var owner = chain.Levels[ownerLevel];
            foreach (var exposure in owner.Exposures.Where(candidate => candidate.ReExposes is null))
            {
                var element = owner.Elements.FirstOrDefault(candidate => Data.Text(candidate, "id") == exposure.Component);
                if (element is null)
                {
                    result.Diagnostics.Add(Finding.Error(
                        DiagnosticCode.ExposureTargetMissing,
                        $"'{owner.Owner}' exposes '{exposure.Path}' on '{exposure.Component}', but it has no such component.",
                        component: exposure.Component,
                        path: exposure.Path));
                    continue;
                }

                var componentName = Data.Text(element, "componentName")!;
                var descriptor = catalog.FindComponent(componentName);
                if (descriptor is null)
                {
                    result.Diagnostics.Add(Finding.Error(
                        DiagnosticCode.MissingComponentDescriptor,
                        $"'{owner.Owner}' exposes '{exposure.Path}' on '{exposure.Component}', but nothing describes the component '{componentName}'.",
                        component: exposure.Component,
                        path: exposure.Path));
                    continue;
                }

                var property = descriptor.Properties.FirstOrDefault(candidate => candidate.Path == exposure.Path);
                if (property is null)
                {
                    result.Diagnostics.Add(Finding.Error(
                        DiagnosticCode.ExposureTargetMissing,
                        $"'{owner.Owner}' exposes '{exposure.Path}' on '{exposure.Component}', but '{componentName}' no longer has that property.",
                        component: exposure.Component,
                        path: exposure.Path));
                    continue;
                }

                var isCollection = property.ValueType == PropertyValueType.Collection;
                var current = new ExposureGrant(
                    exposure.Component,
                    exposure.Path,
                    property,
                    owner.Owner,
                    ownerLevel,
                    isCollection ? [.. (exposure.Operations ?? []).Distinct()] : [],
                    isCollection ? exposure.EditableFields : null,
                    exposure.Label);
                result.Exposed.Add(current);

                for (var contributor = ownerLevel + 1; contributor < chain.Levels.Count; contributor++)
                {
                    result.ByInstance[chain.Levels[contributor].Instance][Key(exposure.Component, exposure.Path)] = current;
                    var reExposure = chain.Levels[contributor].Exposures.FirstOrDefault(candidate =>
                        candidate.ReExposes == owner.Owner && candidate.Component == exposure.Component && candidate.Path == exposure.Path);
                    if (reExposure is null)
                    {
                        break;
                    }

                    consumed.Add(reExposure);
                    var (narrowed, widened) = Narrow(current, reExposure);
                    if (widened)
                    {
                        result.Diagnostics.Add(Finding.Error(
                            DiagnosticCode.ExposureWidensOwner,
                            $"'{chain.Levels[contributor].Owner}' re-exposes more of '{exposure.Path}' than '{owner.Owner}' exposed; only what the owner granted is passed on.",
                            component: exposure.Component,
                            path: exposure.Path));
                    }

                    current = narrowed;
                }
            }
        }

        foreach (var chainLevel in chain.Levels)
        {
            foreach (var reExposure in chainLevel.Exposures.Where(candidate => candidate.ReExposes is not null && !consumed.Contains(candidate)))
            {
                result.Diagnostics.Add(Finding.Error(
                    DiagnosticCode.ReExposureBroken,
                    $"'{chainLevel.Owner}' re-exposes '{reExposure.Path}' on '{reExposure.Component}' from '{reExposure.ReExposes}', which does not expose it to this chain.",
                    component: reExposure.Component,
                    path: reExposure.Path));
            }
        }

        return result;
    }

    static (ExposureGrant Grant, bool Widened) Narrow(ExposureGrant grant, ExposedProperty reExposure)
    {
        var requested = reExposure.Operations ?? [];
        var operations = requested.Where(operation => grant.Operations.Contains(operation)).ToList();
        var fields = grant.EditableFields is null
            ? reExposure.EditableFields
            : (reExposure.EditableFields is null ? grant.EditableFields : [.. reExposure.EditableFields.Where(field => grant.EditableFields.Contains(field))]);
        var granted = grant.EditableFields;
        var widened = operations.Count < requested.Count
            || (granted is not null && reExposure.EditableFields?.Any(field => !granted.Contains(field)) == true);
        return (grant with { Operations = operations, EditableFields = fields, Label = reExposure.Label ?? grant.Label }, widened);
    }
}
