// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json;
using System.Text.Json.Nodes;
using Cratis.Scene.Model;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;
using Cratis.Scene.Model.Exposure;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Sets what the scope's instance contributes to what an owner exposed to it, and adds, removes, reorders and edits the items it
/// contributes to an exposed collection.
/// </summary>
static class InstanceEdits
{
    /// <summary>
    /// Applies an instance value to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplySet(EditSession session, SetInstanceValueEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveGrant(session, edit.Instance, edit.Component, edit.Path, diagnostics) is not { } resolved)
        {
            return;
        }

        var (instance, grant) = resolved;
        if (grant.Descriptor.ValueType == PropertyValueType.Collection)
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.InvalidEdit,
                $"'{grant.Descriptor.Label}' is a collection; add, remove, reorder and edit its items instead.",
                instance: instance,
                component: edit.Component,
                path: edit.Path));
            return;
        }

        var value = Data.FromElement(edit.Value);
        if (!PropertyEdits.CheckValue(session, grant.Descriptor, value, new DiagnosticContext(Component: edit.Component, Instance: instance), diagnostics))
        {
            return;
        }

        var existing = FindContribution(clone, instance, edit.Component, edit.Path);
        if (existing is not null)
        {
            existing["value"] = Data.Clone(value);
        }
        else
        {
            Contributions(clone).Add(new JsonObject { ["instance"] = instance, ["component"] = edit.Component, ["path"] = edit.Path, ["value"] = Data.Clone(value) });
        }
    }

    /// <summary>
    /// Applies a reset of an instance value to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyReset(EditSession session, ResetInstanceValueEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveGrant(session, edit.Instance, edit.Component, edit.Path, diagnostics) is not { } resolved)
        {
            return;
        }

        var existing = FindContribution(clone, resolved.Instance, edit.Component, edit.Path);
        if (existing is not null)
        {
            Contributions(clone).Remove(existing);
        }
    }

    /// <summary>
    /// Applies the addition of a collection item to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyAdd(EditSession session, AddCollectionItemEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveGrant(session, edit.Instance, edit.Component, edit.Path, diagnostics) is not { } resolved || !Permitted(resolved.Grant, CollectionOperation.Add, resolved.Instance, diagnostics))
        {
            return;
        }

        var (instance, grant) = resolved;
        void Refuse(DiagnosticCode code, string message) => diagnostics.Add(Finding.Error(code, message, instance: instance, component: edit.Component, path: edit.Path, itemId: edit.Item.Id));

        if (string.IsNullOrEmpty(edit.Item.Id))
        {
            Refuse(DiagnosticCode.InvalidValue, "An item needs an id.");
            return;
        }

        var existingItems = EffectiveItems(session, edit.Component, edit.Path) ?? [];
        if (existingItems.Exists(item => item.Id == edit.Item.Id))
        {
            Refuse(DiagnosticCode.DuplicateCollectionItem, $"The item id '{edit.Item.Id}' is already used.");
            return;
        }

        var maximum = grant.Descriptor.Constraints?.MaximumItems;
        if (maximum is { } limit && existingItems.Count >= limit)
        {
            Refuse(DiagnosticCode.InvalidValue, $"'{grant.Descriptor.Label}' allows at most {limit} items.");
            return;
        }

        if (!CheckFields(grant, ValuesOf(edit.Item.Values), edit.Item.Id, instance, diagnostics, true))
        {
            return;
        }

        var (contribution, items) = OwnItems(clone, instance, grant);
        if (edit.Index is { } position && (position < 0 || position > items.Count))
        {
            Refuse(DiagnosticCode.IndexOutOfRange, $"There is no position {position} among {items.Count} items.");
            return;
        }

        items.Insert(edit.Index ?? items.Count, JsonSerializer.SerializeToNode(edit.Item, SceneJson.Options));
        Save(clone, instance, grant, contribution, items);
    }

    /// <summary>
    /// Applies the removal of a collection item to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyRemove(EditSession session, RemoveCollectionItemEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveGrant(session, edit.Instance, edit.Component, edit.Path, diagnostics) is not { } resolved || !Permitted(resolved.Grant, CollectionOperation.Remove, resolved.Instance, diagnostics))
        {
            return;
        }

        var (contribution, items) = OwnItems(clone, resolved.Instance, resolved.Grant);
        var position = FindOwnItem(items, edit.ItemId, resolved.Instance, resolved.Grant, session, diagnostics);
        if (position < 0)
        {
            return;
        }

        items.RemoveAt(position);
        Save(clone, resolved.Instance, resolved.Grant, contribution, items);
    }

    /// <summary>
    /// Applies the reordering of a collection item to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyReorder(EditSession session, ReorderCollectionItemEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveGrant(session, edit.Instance, edit.Component, edit.Path, diagnostics) is not { } resolved || !Permitted(resolved.Grant, CollectionOperation.Reorder, resolved.Instance, diagnostics))
        {
            return;
        }

        var (contribution, items) = OwnItems(clone, resolved.Instance, resolved.Grant);
        var position = FindOwnItem(items, edit.ItemId, resolved.Instance, resolved.Grant, session, diagnostics);
        if (position < 0)
        {
            return;
        }

        if (edit.Index < 0 || edit.Index >= items.Count)
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.IndexOutOfRange,
                $"There is no position {edit.Index} among {items.Count} items.",
                instance: resolved.Instance,
                component: edit.Component,
                path: edit.Path,
                itemId: edit.ItemId));
            return;
        }

        var moved = items[position];
        items.RemoveAt(position);
        items.Insert(edit.Index, moved);
        Save(clone, resolved.Instance, resolved.Grant, contribution, items);
    }

    /// <summary>
    /// Applies the change of one field of a collection item to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyEditItem(EditSession session, EditCollectionItemEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveGrant(session, edit.Instance, edit.Component, edit.Path, diagnostics) is not { } resolved || !Permitted(resolved.Grant, CollectionOperation.EditFields, resolved.Instance, diagnostics))
        {
            return;
        }

        var (contribution, items) = OwnItems(clone, resolved.Instance, resolved.Grant);
        var position = FindOwnItem(items, edit.ItemId, resolved.Instance, resolved.Grant, session, diagnostics);
        if (position < 0)
        {
            return;
        }

        var value = Data.FromElement(edit.Value);
        if (!CheckFields(resolved.Grant, new JsonObject { [edit.Field] = Data.Clone(value) }, edit.ItemId, resolved.Instance, diagnostics, false))
        {
            return;
        }

        var item = (JsonObject)items[position]!;
        if (Data.Get(item, "values") is not JsonObject values)
        {
            values = new JsonObject();
            item["values"] = values;
        }

        values[edit.Field] = Data.Clone(value);
        Save(clone, resolved.Instance, resolved.Grant, contribution, items);
    }

    static JsonObject ValuesOf(IReadOnlyDictionary<string, JsonElement> values)
    {
        var result = new JsonObject();
        foreach (var (field, value) in values)
        {
            result[field] = Data.FromElement(value);
        }

        return result;
    }

    static (string Instance, ExposureGrant Grant)? ResolveGrant(EditSession session, string? requested, string component, string path, List<SceneDiagnostic> diagnostics)
    {
        var instance = session.ScopeInstance;
        if (instance is null)
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.UnknownScope,
                $"There is no {LayoutTypeNames.Of(session.Context.Scope.Kind)} named '{session.Context.Scope.Name}'.",
                instance: requested,
                component: component,
                path: path));
            return null;
        }

        if (requested is not null && requested != instance)
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.UnknownInstance,
                $"Edits are made as '{instance}', not as '{requested}'.",
                instance: requested,
                component: component,
                path: path));
            return null;
        }

        if (!session.ScopeGrants.TryGetValue(ExposureGrants.Key(component, path), out var grant))
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.ContributionNotExposed,
                $"'{path}' on '{component}' is not exposed to '{instance}'. An owner exposes it, and each template between re-exposes it.",
                instance: instance,
                component: component,
                path: path));
            return null;
        }

        return (instance, grant);
    }

    static JsonArray Contributions(JsonObject clone) => Data.EnsureArrayAt(clone, DocumentPath.Of("instanceContributions"));

    static JsonObject? FindContribution(JsonObject clone, string instance, string component, string path) =>
        Contributions(clone).OfType<JsonObject>().FirstOrDefault(contribution =>
            Data.Text(contribution, "instance") == instance && Data.Text(contribution, "component") == component && Data.Text(contribution, "path") == path);

    static bool Permitted(ExposureGrant grant, CollectionOperation operation, string instance, List<SceneDiagnostic> diagnostics)
    {
        if (grant.Descriptor.ValueType != PropertyValueType.Collection)
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.InvalidEdit, $"'{grant.Descriptor.Label}' is not a collection.", instance: instance, component: grant.Component, path: grant.Path));
            return false;
        }

        if (!grant.Operations.Contains(operation))
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.ContributionOperationNotPermitted,
                $"'{grant.Descriptor.Label}' does not allow '{LayoutTypeNames.Of(operation)}' from '{instance}'.",
                instance: instance,
                component: grant.Component,
                path: grant.Path));
            return false;
        }

        return true;
    }

    static bool CheckFields(ExposureGrant grant, JsonObject values, string itemId, string instance, List<SceneDiagnostic> diagnostics, bool requireAll)
    {
        var valid = true;
        void Refuse(DiagnosticCode code, string message) => diagnostics.Add(Finding.Error(code, message, instance: instance, component: grant.Component, path: grant.Path, itemId: itemId));

        foreach (var (field, _) in values)
        {
            var known = grant.Descriptor.Item?.Properties.Any(candidate => candidate.Path == field) ?? false;
            if (known && grant.EditableFields?.Contains(field) == false)
            {
                Refuse(DiagnosticCode.ContributionOperationNotPermitted, $"The field '{field}' of '{grant.Descriptor.Label}' is not exposed for editing.");
                valid = false;
            }
        }

        foreach (var problem in ValueValidator.ValidateItemValues(grant.Descriptor.Item, values).Where(problem => requireAll || problem.Problem != "a value is required"))
        {
            var code = problem.Problem.StartsWith("is not a field", StringComparison.Ordinal) ? DiagnosticCode.UnknownCollectionField : DiagnosticCode.InvalidValue;
            Refuse(code, $"'{problem.Field}' {problem.Problem}.");
            valid = false;
        }

        return valid;
    }

    static List<EffectiveCollectionItem>? EffectiveItems(EditSession session, string component, string path) =>
        session.Configuration.Components.FirstOrDefault(candidate => candidate.Component == component)?.Values.FirstOrDefault(value => value.Path == path)?.Items?.ToList();

    static (JsonObject? Contribution, List<JsonNode?> Items) OwnItems(JsonObject clone, string instance, ExposureGrant grant)
    {
        var contribution = FindContribution(clone, instance, grant.Component, grant.Path);
        var items = Data.Get(contribution, "items") is JsonArray list ? list.Select(Data.Clone).ToList() : [];
        return (contribution, items);
    }

    static void Save(JsonObject clone, string instance, ExposureGrant grant, JsonObject? existing, List<JsonNode?> items)
    {
        if (items.Count == 0)
        {
            if (existing is not null)
            {
                Contributions(clone).Remove(existing);
            }

            return;
        }

        var saved = new JsonArray([.. items.Select(Data.Clone)]);
        if (existing is not null)
        {
            existing["items"] = saved;
        }
        else
        {
            Contributions(clone).Add(new JsonObject { ["instance"] = instance, ["component"] = grant.Component, ["path"] = grant.Path, ["items"] = saved });
        }
    }

    static int FindOwnItem(List<JsonNode?> items, string itemId, string instance, ExposureGrant grant, EditSession session, List<SceneDiagnostic> diagnostics)
    {
        var position = items.FindIndex(item => Data.Text(item, "id") == itemId);
        if (position >= 0)
        {
            return position;
        }

        var fixedItem = EffectiveItems(session, grant.Component, grant.Path)?.FirstOrDefault(item => item.Id == itemId);
        var code = fixedItem is not null ? DiagnosticCode.ContributionOperationNotPermitted : DiagnosticCode.CollectionItemNotFound;
        var message = fixedItem is not null
            ? $"The item '{itemId}' belongs to '{fixedItem.Origin}' and cannot be changed from '{instance}'."
            : $"'{instance}' has no item '{itemId}' in '{grant.Descriptor.Label}'.";
        diagnostics.Add(Finding.Error(
            code,
            message,
            instance: instance,
            component: grant.Component,
            path: grant.Path,
            itemId: itemId));
        return -1;
    }
}
