// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Changes the layout type of a flow node or a panel, saying what the change drops.
/// </summary>
static class LayoutTypeEdits
{
    static readonly string[] _allPanelOwn = ["orientation", "spacing", "itemWidth", "itemHeight", "lastChildFill"];

    /// <summary>
    /// Applies a layout type change to a copy of the document.
    /// </summary>
    /// <param name="session">The session.</param>
    /// <param name="edit">The edit.</param>
    /// <param name="clone">The copy of the document.</param>
    /// <param name="diagnostics">Where the reasons go.</param>
    public static void Apply(EditSession session, ChangeLayoutTypeEdit edit, JsonObject clone, List<SceneDiagnostic> diagnostics)
    {
        if (!session.Index.Nodes.TryGetValue(edit.NodeId, out var record))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.UnknownNode, $"There is no node '{edit.NodeId}'.", nodeId: edit.NodeId));
            return;
        }

        if (record.Kind is not (SceneNodeKind.FlowNode or SceneNodeKind.Element))
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.NotALayoutNode, $"'{record.Label}' is not a layout node.", nodeId: edit.NodeId));
            return;
        }

        if (!session.IsLocal(record))
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.NodeNotEditable,
                $"'{edit.NodeId}' is inherited from '{EditSession.SourceOf(record)}' and cannot be changed here.",
                nodeId: edit.NodeId));
            return;
        }

        var descriptor = NodeDescriber.LayoutTypeOf(record.TypeId) is { } layoutType ? session.Context.Catalog.FindLayoutType(layoutType) : null;
        if (descriptor is null)
        {
            diagnostics.Add(Finding.Error(DiagnosticCode.NotALayoutNode, $"'{record.Label}' is not a layout node.", nodeId: edit.NodeId));
            return;
        }

        var to = LayoutTypeNames.Of(edit.To);
        if (!descriptor.Capabilities.ConvertibleTo.Contains(edit.To))
        {
            diagnostics.Add(Finding.Error(
                DiagnosticCode.LayoutTypeNotConvertible,
                $"A {descriptor.Label.ToLowerInvariant()} cannot be changed into '{to}'.",
                nodeId: edit.NodeId));
            return;
        }

        var source = (JsonObject)record.Value!;
        var (result, lost) = record.Kind == SceneNodeKind.FlowNode ? ConvertFlow(source, edit.To) : ConvertPanel(source, edit.To);
        if (lost.Count > 0)
        {
            var dropped = string.Join(", ", lost);
            if (edit.AcceptLoss != true)
            {
                diagnostics.Add(Finding.Error(
                    DiagnosticCode.LossyConversionNotAccepted,
                    $"Changing to '{to}' would drop {dropped}. Accept the loss to go ahead.",
                    nodeId: edit.NodeId));
                return;
            }

            diagnostics.Add(Finding.Warning(DiagnosticCode.LossyConversion, $"Changed to '{to}'; dropped {dropped}.", nodeId: edit.NodeId));
        }

        foreach (var path in Data.MirroredPaths(record.Mirror, record.Path))
        {
            var holder = Data.At(clone, path.Parent());
            var last = path[^1];
            if (last is string name && holder is JsonObject owner)
            {
                owner[name] = Data.Clone(result);
            }
            else if (last is int index && holder is JsonArray list)
            {
                list[index] = Data.Clone(result);
            }
        }
    }

    static bool IsSet(JsonObject node, string property) =>
        node.ContainsKey(property) && !(property == "spacing" && node[property] is JsonValue spacing && Data.TryNumber(spacing, out var number) && number == 0);

    static (JsonObject Result, List<string> Lost) ConvertFlow(JsonObject source, LayoutType to)
    {
        var result = (JsonObject)source.DeepClone();
        var lost = new List<string>();
        var target = to switch
        {
            LayoutType.FlowRow => "Row",
            LayoutType.FlowColumn => "Column",
            _ => "Grid"
        };

        if (Data.Text(source, "kind") == "Grid" && target != "Grid")
        {
            foreach (var property in new[] { "columns", "rows" })
            {
                if (source.ContainsKey(property))
                {
                    lost.Add(property);
                }

                result.Remove(property);
            }

            var spans = Data.List(result, "children").OfType<JsonObject>().Where(child => child.ContainsKey("span")).ToList();
            if (spans.Count > 0)
            {
                lost.Add("span (on children)");
            }

            foreach (var child in spans)
            {
                child.Remove("span");
            }
        }

        result["kind"] = target;
        return (result, lost);
    }

    static (JsonObject Result, List<string> Lost) ConvertPanel(JsonObject source, LayoutType to)
    {
        var result = (JsonObject)source.DeepClone();
        string[] keep = to switch
        {
            LayoutType.StackPanel => ["orientation", "spacing"],
            LayoutType.WrapPanel => ["orientation", "itemWidth", "itemHeight"],
            LayoutType.DockPanel => ["lastChildFill"],
            _ => []
        };

        var lost = _allPanelOwn.Where(property => !keep.Contains(property) && IsSet(source, property)).ToList();
        foreach (var property in _allPanelOwn.Where(candidate => !keep.Contains(candidate)))
        {
            result.Remove(property);
        }

        if (to == LayoutType.StackPanel)
        {
            SetWhenMissing(result, "orientation", "Vertical");
            SetWhenMissing(result, "spacing", 0);
        }
        else if (to == LayoutType.WrapPanel)
        {
            SetWhenMissing(result, "orientation", "Horizontal");
        }
        else
        {
            SetWhenMissing(result, "lastChildFill", true);
        }

        return (result, lost);
    }

    static void SetWhenMissing<T>(JsonObject target, string name, T value)
    {
        if (target[name] is null)
        {
            target[name] = JsonValue.Create(value);
        }
    }
}
