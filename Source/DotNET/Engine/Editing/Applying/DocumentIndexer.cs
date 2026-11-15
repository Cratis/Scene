// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Indexes every addressable node of a document: layouts, templates, dialog templates, screens, their slots, the elements in them,
/// and the flow and freeform arrangements that position them. The index is what inspection and editing look nodes up in. Duplicate
/// element ids are reported, and the second occurrence is left out of the index.
/// </summary>
sealed class DocumentIndexer
{
    readonly JsonObject _document;
    readonly DocumentIndex _index = new();

    DocumentIndexer(JsonObject document) => _document = document;

    /// <summary>
    /// Indexes a document.
    /// </summary>
    /// <param name="document">The document.</param>
    /// <returns>The index.</returns>
    public static DocumentIndex Index(JsonObject document) => new DocumentIndexer(document).Run();

    /// <summary>
    /// Gets the layout type a panel element is, by its shape.
    /// </summary>
    /// <param name="element">The element.</param>
    /// <returns>The layout type, or <see langword="null"/> when the element is no panel or a plain grouping.</returns>
    public static LayoutType? PanelLayoutType(JsonNode? element)
    {
        if (!IsPanel(element))
        {
            return null;
        }

        if (Data.Has(element, "rows") && Data.Has(element, "columns"))
        {
            return LayoutType.GridPanel;
        }

        if (Data.Has(element, "extent"))
        {
            return LayoutType.Canvas;
        }

        if (Data.Has(element, "lastChildFill"))
        {
            return LayoutType.DockPanel;
        }

        if (Data.Has(element, "spacing") && Data.Has(element, "orientation"))
        {
            return LayoutType.StackPanel;
        }

        if (Data.Has(element, "orientation") && !Data.Has(element, "spacing"))
        {
            return LayoutType.WrapPanel;
        }

        return null;
    }

    /// <summary>
    /// Gets the layout type a flow node is.
    /// </summary>
    /// <param name="node">The flow node.</param>
    /// <returns>The layout type.</returns>
    public static LayoutType FlowLayoutType(JsonNode? node)
    {
        if (IsFlowContainer(node))
        {
            return Data.Text(node, "kind") switch
            {
                "Row" => LayoutType.FlowRow,
                "Column" => LayoutType.FlowColumn,
                _ => LayoutType.FlowGrid
            };
        }

        return Data.Has(node, "slotName") ? LayoutType.FlowSlotLeaf : LayoutType.FlowLeaf;
    }

    /// <summary>
    /// Gets whether a flow node is a container.
    /// </summary>
    /// <param name="node">The flow node.</param>
    /// <returns><see langword="true"/> for a row, column or grid.</returns>
    public static bool IsFlowContainer(JsonNode? node) => Data.Has(node, "kind") && Data.Has(node, "children");

    /// <summary>
    /// Gets whether a flow node is a leaf holding an element.
    /// </summary>
    /// <param name="node">The flow node.</param>
    /// <returns><see langword="true"/> for a leaf.</returns>
    public static bool IsFlowLeaf(JsonNode? node) => Data.Has(node, "content");

    /// <summary>
    /// Gets whether an element is a panel.
    /// </summary>
    /// <param name="element">The element.</param>
    /// <returns><see langword="true"/> when it has children.</returns>
    public static bool IsPanel(JsonNode? element) => Data.Has(element, "children");

    /// <summary>
    /// Gets whether an element is a component of a package.
    /// </summary>
    /// <param name="element">The element.</param>
    /// <returns><see langword="true"/> when it names a component.</returns>
    public static bool IsExternalComponent(JsonNode? element) => Data.Has(element, "componentName");

    /// <summary>
    /// Gets whether an element is a content control.
    /// </summary>
    /// <param name="element">The element.</param>
    /// <returns><see langword="true"/> when it has content.</returns>
    public static bool IsContentControl(JsonNode? element) => Data.Has(element, "content");

    /// <summary>
    /// Gets whether an element is an items control.
    /// </summary>
    /// <param name="element">The element.</param>
    /// <returns><see langword="true"/> when it has an items source and an item template.</returns>
    public static bool IsItemsControl(JsonNode? element) => Data.Has(element, "itemsSource") && Data.Has(element, "itemTemplate");

    static string Truthy(string? text) => text ?? string.Empty;

    static int FindIndex(IReadOnlyList<JsonNode?> slots, string name)
    {
        for (var position = 0; position < slots.Count; position++)
        {
            if (Data.Text(slots[position], "name") == name)
            {
                return position;
            }
        }

        return -1;
    }

    DocumentIndex Run()
    {
        Owners("layouts", "layouts", SceneNodeKind.Layout, NodeIds.Layout, null);
        Owners("screenTemplates", "screenTemplates", SceneNodeKind.ScreenTemplate, NodeIds.ScreenTemplate, "content");
        Owners("dialogTemplates", "dialogTemplates", SceneNodeKind.DialogTemplate, NodeIds.DialogTemplate, "content");
        Owners("screens", "screens", SceneNodeKind.Screen, NodeIds.Screen, "slotContent");
        return _index;
    }

    void Owners(string key, string pathKey, SceneNodeKind kind, Func<string, string> idOf, string? contentKey)
    {
        var owners = Data.List(_document, key);
        for (var position = 0; position < owners.Count; position++)
        {
            var name = Truthy(Data.Text(owners[position], "name"));
            Owner(owners[position]!, DocumentPath.Of(pathKey, position), new OwnerContext(name, kind, idOf(name)), contentKey);
        }
    }

    bool Add(NodeRecord record)
    {
        if (_index.Nodes.ContainsKey(record.Id))
        {
            return false;
        }

        _index.Nodes[record.Id] = record;
        return true;
    }

    void Owner(JsonNode owner, DocumentPath path, OwnerContext context, string? contentKey)
    {
        Add(new NodeRecord
        {
            Id = context.OwnerId,
            Kind = context.OwnerKind,
            TypeId = LayoutTypeNames.Of(context.OwnerKind),
            Label = Truthy(Data.Text(owner, "name")),
            Path = path,
            Value = owner,
            Owner = context.Owner,
            OwnerKind = context.OwnerKind
        });

        var content = contentKey is null ? null : Data.Get(owner, contentKey) as JsonObject;
        var ownsSlots = Data.Has(owner, "slots");
        var declared = ownsSlots ? Data.List(owner, "slots") : SlotsAvailableTo(owner);
        var slotNames = new List<string>();
        foreach (var slot in declared)
        {
            var slotName = Truthy(Data.Text(slot, "name"));
            if (!slotNames.Contains(slotName))
            {
                slotNames.Add(slotName);
            }
        }

        foreach (var key in content?.Select(entry => entry.Key) ?? [])
        {
            if (!slotNames.Contains(key))
            {
                slotNames.Add(key);
            }
        }

        foreach (var name in slotNames)
        {
            var slotId = NodeIds.Slot(context.OwnerId, name);
            var declaration = ownsSlots ? FindIndex(declared, name) : -1;
            var contentPath = contentKey is null ? null : path.Append(contentKey, name);
            var slotContent = content is not null && content.TryGetPropertyValue(name, out var found) ? found : null;
            Add(new NodeRecord
            {
                Id = slotId,
                Kind = SceneNodeKind.Slot,
                TypeId = "slot",
                Label = name,
                Path = declaration >= 0 ? path.Append("slots", declaration) : contentPath!,
                Value = declaration >= 0 ? declared[declaration] : slotContent,
                ParentId = context.OwnerId,
                Owner = context.Owner,
                OwnerKind = context.OwnerKind,
                SlotName = name,
                ContentPath = contentPath
            });

            if (declaration >= 0 && Data.Get(declared[declaration], "arrangement") is { } slotArrangement)
            {
                Arrangement(slotArrangement, path.Append("slots", declaration, "arrangement"), slotId, context, slotId);
            }

            if (slotContent is JsonArray elements)
            {
                for (var position = 0; position < elements.Count; position++)
                {
                    Element(elements[position]!, contentPath!.Append(position), context, new Placement(slotId, new ListLocation(contentPath, position)));
                }
            }
        }

        if (Data.Get(owner, "arrangement") is { } arrangement)
        {
            Arrangement(arrangement, path.Append("arrangement"), NodeIds.OwnerArrangement(context.OwnerId), context, context.OwnerId);
        }

        if (Data.Has(owner, "contributions"))
        {
            var contributions = Data.List(owner, "contributions");
            for (var position = 0; position < contributions.Count; position++)
            {
                if (Data.Get(contributions[position], "content") is { } contributed)
                {
                    Element(contributed, path.Append("contributions", position, "content"), context, new Placement(context.OwnerId));
                }
            }
        }
    }

    IReadOnlyList<JsonNode?> SlotsAvailableTo(JsonNode screen)
    {
        var templateName = Data.Text(screen, "screenTemplate");
        var template = templateName is null ? null : Data.List(_document, "screenTemplates").FirstOrDefault(candidate => Data.Text(candidate, "name") == templateName);
        if (template is not null)
        {
            return Data.List(template, "slots");
        }

        var layoutName = Data.Text(screen, "layout");
        var layout = Data.List(_document, "layouts").FirstOrDefault(candidate => Data.Text(candidate, "name") == layoutName);
        return layout is null ? [] : Data.List(layout, "slots");
    }

    bool Element(JsonNode element, DocumentPath path, OwnerContext context, Placement placement)
    {
        var id = NodeIds.Element(Truthy(Data.Text(element, "id")));
        var panelType = PanelLayoutType(element);
        var typeId = IsExternalComponent(element)
            ? Truthy(Data.Text(element, "componentName"))
            : (panelType is { } type ? LayoutTypeNames.Of(type) : (IsContentControl(element) ? "contentControl" : (IsItemsControl(element) ? "itemsControl" : "element")));
        var elementName = Data.Text(element, "name");
        var propertyLabel = Data.Text(Data.Get(element, "properties"), "label");
        var label = !string.IsNullOrEmpty(propertyLabel) ? propertyLabel
            : (IsPanel(element) && !string.IsNullOrEmpty(elementName) ? elementName
            : (IsExternalComponent(element) && !string.IsNullOrEmpty(elementName) ? elementName : typeId));

        if (!Add(new NodeRecord
        {
            Id = id,
            Kind = SceneNodeKind.Element,
            TypeId = typeId,
            Label = label,
            Path = path,
            Value = element,
            ParentId = placement.ParentId,
            Owner = context.Owner,
            OwnerKind = context.OwnerKind,
            List = placement.List,
            LeafId = placement.LeafId,
            Mirror = placement.Mirror
        }))
        {
            _index.Diagnostics.Add(Finding.Error(DiagnosticCode.DuplicateElementId, $"The element id '{Data.Text(element, "id")}' is used more than once.", nodeId: id));
            return false;
        }

        if (IsExternalComponent(element))
        {
            if (Data.Get(element, "slots") is JsonObject slots)
            {
                foreach (var (name, children) in slots)
                {
                    if (children is JsonArray list)
                    {
                        for (var position = 0; position < list.Count; position++)
                        {
                            Element(list[position]!, path.Append("slots", name, position), context, new Placement(id, new ListLocation(path.Append("slots", name), position), Mirror: placement.Mirror));
                        }
                    }
                }
            }
        }
        else if (IsContentControl(element))
        {
            Element(Data.Get(element, "content")!, path.Append("content"), context, new Placement(id, Mirror: placement.Mirror));
        }
        else if (IsItemsControl(element))
        {
            Element(Data.Get(element, "itemTemplate")!, path.Append("itemTemplate"), context, new Placement(id, Mirror: placement.Mirror));
        }
        else if (IsPanel(element))
        {
            var children = Data.List(element, "children");
            for (var position = 0; position < children.Count; position++)
            {
                Element(children[position]!, path.Append("children", position), context, new Placement(id, new ListLocation(path.Append("children"), position), Mirror: placement.Mirror));
            }
        }

        return true;
    }

    void Arrangement(JsonNode arrangement, DocumentPath path, string holderId, OwnerContext context, string parentId)
    {
        if (Data.Get(arrangement, "root") is { } root)
        {
            FlowNode(root, path.Append("root"), holderId, "root", [], context, new Placement(parentId));
            var overrides = Data.List(arrangement, "overrides");
            for (var position = 0; position < overrides.Count; position++)
            {
                if (Data.Get(overrides[position], "root") is { } overrideRoot)
                {
                    FlowNode(overrideRoot, path.Append("overrides", position, "root"), holderId, $"override{position}", [], context, new Placement(parentId));
                }
            }

            return;
        }

        if (Data.Get(arrangement, "variants") is not JsonArray variants)
        {
            return;
        }

        var freeformId = NodeIds.Freeform(holderId);
        Add(new NodeRecord
        {
            Id = freeformId,
            Kind = SceneNodeKind.Freeform,
            TypeId = LayoutTypeNames.Of(LayoutType.Freeform),
            Label = "Freeform",
            Path = path,
            Value = arrangement,
            ParentId = parentId,
            Owner = context.Owner,
            OwnerKind = context.OwnerKind
        });

        var firstCopy = new Dictionary<string, DocumentPath>(StringComparer.Ordinal);
        for (var variantIndex = 0; variantIndex < variants.Count; variantIndex++)
        {
            var placements = Data.List(variants[variantIndex], "placements");
            for (var placementIndex = 0; placementIndex < placements.Count; placementIndex++)
            {
                var placement = placements[placementIndex]!;
                var placementPath = path.Append("variants", variantIndex, "placements", placementIndex);
                var placedElement = Data.Get(placement, "element");
                var placedElementId = Data.Text(placedElement, "id");
                var key = placedElementId ?? Data.Text(placement, "slotName") ?? placementIndex.ToString(System.Globalization.CultureInfo.InvariantCulture);
                var placementId = NodeIds.Placement(holderId, variantIndex, key);
                Add(new NodeRecord
                {
                    Id = placementId,
                    Kind = SceneNodeKind.Placement,
                    TypeId = "placement",
                    Label = key,
                    Path = placementPath,
                    Value = placement,
                    ParentId = freeformId,
                    Owner = context.Owner,
                    OwnerKind = context.OwnerKind,
                    List = new ListLocation(path.Append("variants", variantIndex, "placements"), placementIndex)
                });

                if (placedElement is null)
                {
                    continue;
                }

                var elementPath = placementPath.Append("element");
                var elementId = NodeIds.Element(placedElementId ?? string.Empty);
                _index.Nodes.TryGetValue(elementId, out var known);
                if (known is not null && firstCopy.ContainsKey(placedElementId ?? string.Empty))
                {
                    known.PlacementIds!.Add(placementId);
                    known.Mirror!.Others.Add(elementPath);
                    continue;
                }

                firstCopy[placedElementId ?? string.Empty] = elementPath;
                var mirror = new Mirror(elementPath);
                if (Element(placedElement, elementPath, context, new Placement(placementId, Mirror: mirror)))
                {
                    _index.Nodes[elementId].PlacementIds = [placementId];
                }
            }
        }
    }

    void FlowNode(JsonNode node, DocumentPath path, string holderId, string variant, IReadOnlyList<int> indexPath, OwnerContext context, Placement placement)
    {
        var id = NodeIds.FlowNode(holderId, variant, indexPath);
        var type = LayoutTypeNames.Of(FlowLayoutType(node));
        Add(new NodeRecord
        {
            Id = id,
            Kind = SceneNodeKind.FlowNode,
            TypeId = type,
            Label = type,
            Path = path,
            Value = node,
            ParentId = placement.ParentId,
            Owner = context.Owner,
            OwnerKind = context.OwnerKind,
            List = placement.List,
            LeafId = placement.LeafId,
            Mirror = placement.Mirror
        });

        if (IsFlowContainer(node))
        {
            var children = Data.List(node, "children");
            for (var position = 0; position < children.Count; position++)
            {
                FlowNode(children[position]!, path.Append("children", position), holderId, variant, [.. indexPath, position], context, new Placement(id, new ListLocation(path.Append("children"), position)));
            }
        }
        else if (IsFlowLeaf(node) && Data.Get(node, "content") is { } content)
        {
            Element(content, path.Append("content"), context, new Placement(id, LeafId: id));
        }
    }

    sealed record OwnerContext(string Owner, SceneNodeKind OwnerKind, string OwnerId);

    sealed record Placement(string? ParentId = null, ListLocation? List = null, string? LeafId = null, Mirror? Mirror = null);
}
