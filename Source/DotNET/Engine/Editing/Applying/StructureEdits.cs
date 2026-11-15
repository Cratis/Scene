// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Inserts, moves and removes nodes: elements in slots and panels, flow nodes in flow containers.
/// </summary>
static class StructureEdits
{
    /// <summary>
    /// Applies an insertion to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyInsert(EditSession session, InsertNodeEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if ((edit.Element is null) == (edit.FlowNode is null))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.InvalidEdit, "Give exactly one of element and flowNode.", nodeId: edit.Target));
            return;
        }

        if (ResolveInsertionPoint(session, edit.Target, edit.Slot, diagnostics) is not { } point)
        {
            return;
        }

        var payload = Data.FromElement(edit.Element ?? edit.FlowNode);
        var identities = ElementIdsIn(payload, []);
        var duplicate = identities.Where((identity, position) => identities.IndexOf(identity) != position || session.Index.Nodes.ContainsKey(NodeIds.Element(identity))).FirstOrDefault();
        if (duplicate is not null)
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.ElementIdInUse, $"The element id '{duplicate}' is already used.", nodeId: edit.Target));
            return;
        }

        InsertInto(session, clone, point, payload!, edit.FlowNode is not null, edit.Index, diagnostics);
    }

    /// <summary>
    /// Applies a removal to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyRemove(EditSession session, RemoveNodeEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveRemoval(session, edit.NodeId, diagnostics) is { } removal)
        {
            TakeOut(session, clone, removal);
        }
    }

    /// <summary>
    /// Applies a move to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void ApplyMove(EditSession session, MoveNodeEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (ResolveRemoval(session, edit.NodeId, diagnostics) is not { } removal)
        {
            return;
        }

        if (ResolveInsertionPoint(session, edit.Target, edit.Slot, diagnostics) is not { } point)
        {
            return;
        }

        var moved = session.Index.Nodes[edit.NodeId];
        for (var ancestor = point.Record; ancestor is not null; ancestor = ancestor.ParentId is null ? null : session.Index.Nodes.GetValueOrDefault(ancestor.ParentId))
        {
            if (ancestor.Id == moved.Id)
            {
                diagnostics.Add(Finding.Error(DiagnosticCode.ContainmentCycle, $"'{moved.Label}' cannot be moved into itself or something inside it.", nodeId: edit.NodeId));
                return;
            }
        }

        var payload = Data.Clone(removal.Payload);
        var arrays = point.Paths.Select(path => Data.EnsureArrayAt(clone, path)).ToList();
        TakeOut(session, clone, removal);
        if (removal.IsFlowNode && !point.Flow)
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.InvalidEdit, "A flow node can only go into a flow container.", nodeId: edit.NodeId));
            return;
        }

        var length = arrays[0].Count;
        if (edit.Index is { } index && (index < 0 || index > length))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.IndexOutOfRange, $"There is no position {index} among {length} children.", nodeId: edit.Target));
            return;
        }

        if (!CheckCapacity(session, point, length, diagnostics))
        {
            return;
        }

        foreach (var array in arrays)
        {
            var node = point.Flow && !removal.IsFlowNode ? new JsonObject { ["content"] = Data.Clone(payload) } : Data.Clone(payload);
            array.Insert(edit.Index ?? array.Count, node);
        }
    }

    static List<string> ElementIdsIn(JsonNode? value, List<string> found)
    {
        switch (value)
        {
            case JsonArray list:
                foreach (var item in list)
                {
                    ElementIdsIn(item, found);
                }

                break;

            case JsonObject owner:
                if (Data.Text(owner, "id") is { } id && Data.Get(owner, "properties") is JsonObject or JsonArray)
                {
                    found.Add(id);
                }

                foreach (var (_, child) in owner)
                {
                    ElementIdsIn(child, found);
                }

                break;
        }

        return found;
    }

    static InsertionPoint? ResolveInsertionPoint(EditSession session, string targetId, string? slot, List<SceneDiagnostic> diagnostics)
    {
        InsertionPoint? Refuse(DiagnosticCode code, string message)
        {
            diagnostics.Add(Finding.Error(code, message, nodeId: targetId));
            return null;
        }

        if (!session.Index.Nodes.TryGetValue(targetId, out var record))
        {
            return Refuse(DiagnosticCode.UnknownNode, $"There is no node '{targetId}'.");
        }

        if (!session.IsLocal(record))
        {
            return Refuse(DiagnosticCode.NodeNotEditable, $"'{targetId}' is inherited from '{EditSession.SourceOf(record)}' and cannot be changed here.");
        }

        IReadOnlyList<DocumentPath> Paths(DocumentPath path) => Data.MirroredPaths(record.Mirror, path);

        switch (record.Kind)
        {
            case SceneNodeKind.Slot:
                return record.ContentPath is { } contentPath
                    ? new InsertionPoint(record, Paths(contentPath), false)
                    : Refuse(DiagnosticCode.TargetDoesNotAcceptChildren, $"'{record.Label}' is a slot of a layout; a layout declares slots and screens fill them.");

            case SceneNodeKind.FlowNode:
                return NodeDescriber.LayoutTypeOf(record.TypeId) is LayoutType.FlowLeaf or LayoutType.FlowSlotLeaf
                    ? Refuse(DiagnosticCode.TargetDoesNotAcceptChildren, "A flow leaf holds one element and takes no children; insert into its container.")
                    : new InsertionPoint(record, Paths(record.Path.Append("children")), true);

            case SceneNodeKind.Element:
                if (DocumentIndexer.IsExternalComponent(record.Value))
                {
                    return !string.IsNullOrEmpty(slot)
                        ? new InsertionPoint(record, Paths(record.Path.Append("slots", slot)), false)
                        : Refuse(DiagnosticCode.UnknownSlot, $"Say which slot of '{Data.Text(record.Value, "componentName")}' to insert into.");
                }

                return DocumentIndexer.IsPanel(record.Value)
                    ? new InsertionPoint(record, Paths(record.Path.Append("children")), false)
                    : Refuse(DiagnosticCode.TargetDoesNotAcceptChildren, $"'{record.Label}' holds a single element and takes no children.");

            default:
                return Refuse(DiagnosticCode.TargetDoesNotAcceptChildren, $"'{record.Label}' does not take children. Freeform arrangements place elements through their placements.");
        }
    }

    static bool CheckCapacity(EditSession session, InsertionPoint point, int current, List<SceneDiagnostic> diagnostics)
    {
        var maximum = NodeDescriber.LayoutTypeOf(point.Record.TypeId) is { } type ? session.Context.Catalog.FindLayoutType(type)?.Capabilities.MaximumChildren : null;
        if (maximum is { } limit && current >= limit)
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.MaximumChildrenExceeded, $"'{point.Record.Label}' holds at most {limit} children.", nodeId: point.Record.Id));
            return false;
        }

        return true;
    }

    static void InsertInto(EditSession session, JsonObject clone, InsertionPoint point, JsonNode payload, bool isFlowNode, int? index, List<SceneDiagnostic> diagnostics)
    {
        if (isFlowNode && !point.Flow)
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.InvalidEdit, "A flow node can only go into a flow container.", nodeId: point.Record.Id));
            return;
        }

        var arrays = point.Paths.Select(path => Data.EnsureArrayAt(clone, path)).ToList();
        var length = arrays[0].Count;
        if (index is { } position && (position < 0 || position > length))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.IndexOutOfRange, $"There is no position {position} among {length} children.", nodeId: point.Record.Id));
            return;
        }

        if (!CheckCapacity(session, point, length, diagnostics))
        {
            return;
        }

        foreach (var array in arrays)
        {
            var node = point.Flow && !isFlowNode ? new JsonObject { ["content"] = Data.Clone(payload) } : Data.Clone(payload);
            array.Insert(index ?? array.Count, node);
        }
    }

    static Removal? ResolveRemoval(EditSession session, string nodeId, List<SceneDiagnostic> diagnostics)
    {
        if (!session.Index.Nodes.TryGetValue(nodeId, out var record))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.UnknownNode, $"There is no node '{nodeId}'.", nodeId: nodeId));
            return null;
        }

        if (!session.IsLocal(record))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.NodeNotEditable, $"'{nodeId}' is inherited from '{EditSession.SourceOf(record)}' and cannot be changed here.", nodeId: nodeId));
            return null;
        }

        var holder = record.LeafId is not null ? session.Index.Nodes[record.LeafId] : record;
        var isElement = record.Kind == SceneNodeKind.Element;
        var removable = holder.List is not null || (isElement && record.PlacementIds is not null);
        if (!removable || record.Kind is not (SceneNodeKind.Element or SceneNodeKind.FlowNode))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.NodeNotRemovable, $"'{record.Label}' cannot be moved or removed on its own.", nodeId: nodeId));
            return null;
        }

        return new Removal(isElement && record.PlacementIds is not null ? record : holder, record.Value!, !isElement);
    }

    static void TakeOut(EditSession session, JsonObject clone, Removal removal)
    {
        var holder = removal.Holder;
        if (holder.PlacementIds is not null && holder.Kind == SceneNodeKind.Element)
        {
            foreach (var placementId in holder.PlacementIds)
            {
                var placement = session.Index.Nodes[placementId];
                RemoveAt(Data.At(clone, placement.List!.Path) as JsonArray, placement.List.Index);
            }

            return;
        }

        foreach (var path in Data.MirroredPaths(holder.Mirror, holder.List!.Path))
        {
            RemoveAt(Data.At(clone, path) as JsonArray, holder.List.Index);
        }
    }

    static void RemoveAt(JsonArray? array, int index)
    {
        if (array is not null && index >= 0 && index < array.Count)
        {
            array.RemoveAt(index);
        }
    }

    sealed record InsertionPoint(NodeRecord Record, IReadOnlyList<DocumentPath> Paths, bool Flow);

    sealed record Removal(NodeRecord Holder, JsonNode Payload, bool IsFlowNode);
}
