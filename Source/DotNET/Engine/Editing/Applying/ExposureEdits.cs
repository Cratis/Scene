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
/// Declares and withdraws what a layout or template lets what sits inside it configure.
/// </summary>
static class ExposureEdits
{
    /// <summary>
    /// Applies an exposure to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyExpose(EditSession session, ExposePropertyEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (!OwnsDeclaration(session, edit.Owner, diagnostics) || !ValidateExposure(session, edit.Property, diagnostics))
        {
            return;
        }

        var exposures = Data.EnsureArrayAt(clone, DocumentPath.Of("exposures"));
        var declaration = exposures.OfType<JsonObject>().FirstOrDefault(candidate => Data.Text(candidate, "owner") == edit.Owner);
        if (declaration is null)
        {
            declaration = new JsonObject { ["owner"] = edit.Owner, ["properties"] = new JsonArray() };
            exposures.Add(declaration);
        }

        var properties = Data.EnsureArrayAt(declaration, DocumentPath.Of("properties"));
        var property = JsonSerializer.SerializeToNode(edit.Property, SceneJson.Options);
        var position = FindIndex(properties, edit.Property.Component, edit.Property.Path, edit.Property.ReExposes);
        if (position >= 0)
        {
            properties[position] = property;
        }
        else
        {
            properties.Add(property);
        }
    }

    /// <summary>
    /// Applies a withdrawal to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyUnexpose(EditSession session, UnexposePropertyEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (!OwnsDeclaration(session, edit.Owner, diagnostics))
        {
            return;
        }

        var exposures = Data.EnsureArrayAt(clone, DocumentPath.Of("exposures"));
        var declaration = exposures.OfType<JsonObject>().FirstOrDefault(candidate => Data.Text(candidate, "owner") == edit.Owner);
        var properties = declaration is null ? null : Data.Get(declaration, "properties") as JsonArray;
        var remaining = properties?.Where(candidate => !(Data.Text(candidate, "component") == edit.Component && Data.Text(candidate, "path") == edit.Path)).ToList();
        if (declaration is null || properties is null || remaining!.Count == properties.Count)
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.ExposureTargetMissing,
                $"'{edit.Owner}' does not expose '{edit.Path}' on '{edit.Component}'.",
                component: edit.Component,
                path: edit.Path));
            return;
        }

        if (remaining.Count == 0)
        {
            exposures.Remove(declaration);
        }
        else
        {
            declaration["properties"] = new JsonArray([.. remaining.Select(Data.Clone)]);
        }
    }

    static int FindIndex(JsonArray properties, string component, string path, string? reExposes)
    {
        for (var position = 0; position < properties.Count; position++)
        {
            var candidate = properties[position];
            if (Data.Text(candidate, "component") == component && Data.Text(candidate, "path") == path && Data.Text(candidate, "reExposes") == reExposes)
            {
                return position;
            }
        }

        return -1;
    }

    static bool OwnsDeclaration(EditSession session, string owner, List<SceneDiagnostic> diagnostics)
    {
        if (session.Chain.Levels.Count == 0 || session.Chain.Levels[^1].Owner != owner)
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.NodeNotEditable,
                $"Exposure is declared by the layout or template that owns the component. '{owner}' is not what is being edited."));
            return false;
        }

        return true;
    }

    static bool ValidateExposure(EditSession session, ExposedProperty property, List<SceneDiagnostic> diagnostics)
    {
        var level = session.Chain.Levels[^1];
        var reExposed = property.ReExposes is not null;
        if (!reExposed && !level.Elements.Any(candidate => Data.Text(candidate, "id") == property.Component))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.ExposureTargetMissing, $"'{level.Owner}' has no component '{property.Component}'.", component: property.Component, path: property.Path));
            return false;
        }

        var grant = reExposed ? session.ScopeGrants.GetValueOrDefault(ExposureGrants.Key(property.Component, property.Path)) : null;
        if (reExposed && (grant is null || grant.Owner != property.ReExposes))
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.ReExposureBroken,
                $"'{property.ReExposes}' does not expose '{property.Path}' on '{property.Component}' to '{level.Owner}', so it cannot be passed on.",
                component: property.Component,
                path: property.Path));
            return false;
        }

        var element = level.Elements.FirstOrDefault(candidate => Data.Text(candidate, "id") == property.Component);
        var descriptor = grant is not null
            ? grant.Descriptor
            : session.Context.Catalog.FindComponent(Data.Text(element, "componentName") ?? string.Empty)?.Properties.FirstOrDefault(candidate => candidate.Path == property.Path);
        if (descriptor is null)
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.ExposureTargetMissing, $"There is no editable property '{property.Path}' on '{property.Component}'.", component: property.Component, path: property.Path));
            return false;
        }

        var operations = property.Operations ?? [];
        if (descriptor.ValueType != PropertyValueType.Collection)
        {
            if (operations.Count > 0 || property.EditableFields is not null)
            {
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.InvalidEdit,
                    $"'{descriptor.Label}' is not a collection, so operations and editable fields do not apply.",
                    component: property.Component,
                    path: property.Path));
                return false;
            }

            return true;
        }

        var fields = descriptor.Item?.Properties.Select(candidate => candidate.Path).ToList() ?? [];
        var unknownField = property.EditableFields?.FirstOrDefault(field => !fields.Contains(field));
        if (unknownField is not null)
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.UnknownCollectionField,
                $"Items of '{descriptor.Label}' have no field '{unknownField}'.",
                component: property.Component,
                path: property.Path));
            return false;
        }

        if (grant is not null && (operations.Any(operation => !grant.Operations.Contains(operation))
            || (grant.EditableFields is not null && (property.EditableFields ?? fields).Any(field => !grant.EditableFields.Contains(field)))))
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.ExposureWidensOwner,
                $"'{property.ReExposes}' exposed less of '{descriptor.Label}' than this re-exposes.",
                component: property.Component,
                path: property.Path));
            return false;
        }

        return true;
    }
}
