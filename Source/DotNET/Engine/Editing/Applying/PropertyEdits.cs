// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Sets a property of a node and takes it back to its default.
/// </summary>
static class PropertyEdits
{
    /// <summary>
    /// Finds the node and descriptor an edit of a property addresses, or says why it cannot.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="nodeId">The node.</param>
    /// <param name="path">The property path.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    /// <returns>The node and the descriptor of its property, or <see langword="null"/> when the edit cannot address a property.</returns>
    public static (NodeRecord Record, PropertyDescriptor Descriptor)? ResolveEditableProperty(EditSession session, string nodeId, string path, List<SceneDiagnostic> diagnostics)
    {
        if (!session.Index.Nodes.TryGetValue(nodeId, out var record))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.UnknownNode, $"There is no node '{nodeId}'.", nodeId: nodeId));
            return null;
        }

        if (!session.IsLocal(record))
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.NodeNotEditable,
                $"'{nodeId}' is inherited from '{EditSession.SourceOf(record)}'. An exposed property is configured with an instance edit, not by changing the node.",
                nodeId: nodeId,
                path: path));
            return null;
        }

        var description = NodeDescriber.Describe(record, session.Context.Catalog);
        var descriptor = description.Properties.FirstOrDefault(candidate => candidate.Path == path);
        if (descriptor is null)
        {
            diagnostics.Add(Finding.Error(
                description.Diagnostics.Count > 0 ? DiagnosticCode.MissingComponentDescriptor : DiagnosticCode.UnknownProperty,
                description.Diagnostics.Count > 0 ? description.Diagnostics[0].Message : $"'{record.TypeId}' has no property '{path}'.",
                nodeId: nodeId,
                path: path));
            return null;
        }

        if (descriptor.ReadOnly == true)
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.ReadOnlyProperty, $"'{descriptor.Label}' is read-only.", nodeId: nodeId, path: path));
            return null;
        }

        return (record, descriptor);
    }

    /// <summary>
    /// Checks a value for a property, including a query binding against the host's candidates.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="descriptor">The descriptor of the property.</param>
    /// <param name="value">The value.</param>
    /// <param name="context">What the finding is about besides the property.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    /// <returns>Whether the value is acceptable; the reasons are added to <paramref name="diagnostics"/>.</returns>
    public static bool CheckValue(EditSession session, PropertyDescriptor descriptor, JsonNode? value, DiagnosticContext context, List<SceneDiagnostic> diagnostics)
    {
        var problem = ValueValidator.Validate(descriptor, value);
        if (problem is not null)
        {
            diagnostics.Add(Finding.With(Finding.Error(DiagnosticCode.InvalidValue, $"'{descriptor.Label}': {problem}.", path: descriptor.Path), context));
            return false;
        }

        var candidates = session.Context.QueryCandidates;
        if (descriptor.ValueType == PropertyValueType.QueryReference && candidates is not null && value is JsonObject)
        {
            var binding = QueryBindingValue.Read(value);
            var problems = BindingValidator.Validate(descriptor, candidates.FirstOrDefault(candidate => candidate.Id == binding.QueryId), binding);
            diagnostics.AddRange(problems.Select(problemDiagnostic => Finding.With(problemDiagnostic, context)));
            return problems.Count == 0;
        }

        return true;
    }

    /// <summary>
    /// Applies a property set to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplySet(EditSession session, SetPropertyEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveEditableProperty(session, edit.NodeId, edit.Path, diagnostics) is not { } resolved)
        {
            return;
        }

        var (record, descriptor) = resolved;
        var value = Data.FromElement(edit.Value);
        if (!CheckValue(session, descriptor, value, new DiagnosticContext(NodeId: edit.NodeId), diagnostics))
        {
            return;
        }

        foreach (var path in Data.MirroredPaths(record.Mirror, record.Path))
        {
            if (BagFor(clone, record, path) is { } bag)
            {
                Data.SetValueAtPath(bag, edit.Path, Data.Clone(value));
            }
        }
    }

    /// <summary>
    /// Applies a property reset to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyReset(EditSession session, ResetPropertyEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveEditableProperty(session, edit.NodeId, edit.Path, diagnostics) is not { } resolved)
        {
            return;
        }

        var (record, descriptor) = resolved;
        if (descriptor.Constraints?.Required == true && descriptor.Default is null)
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.InvalidValue, $"'{descriptor.Label}' is required and has no default to go back to.", nodeId: edit.NodeId, path: edit.Path));
            return;
        }

        foreach (var path in Data.MirroredPaths(record.Mirror, record.Path))
        {
            if (BagFor(clone, record, path) is { } bag)
            {
                Data.RemoveValueAtPath(bag, edit.Path);
            }
        }
    }

    static JsonObject? BagFor(JsonObject root, NodeRecord record, DocumentPath path)
    {
        if (Data.At(root, path) is not JsonObject target)
        {
            return null;
        }

        var isComponent = record.Kind == SceneNodeKind.Element && Data.Has(target, "componentName");
        if (!isComponent)
        {
            return target;
        }

        if (Data.Get(target, "properties") is not JsonObject properties)
        {
            properties = new JsonObject();
            target["properties"] = properties;
        }

        return properties;
    }
}
