// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Nodes;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Everything the engine knows about one addressable node.
/// </summary>
sealed class NodeRecord
{
    /// <summary>
    /// Gets the id of the node.
    /// </summary>
    public required string Id { get; init; }

    /// <summary>
    /// Gets the kind of node.
    /// </summary>
    public required SceneNodeKind Kind { get; init; }

    /// <summary>
    /// Gets a layout type for a layout node, the component name for a component, otherwise the kind of element.
    /// </summary>
    public required string TypeId { get; init; }

    /// <summary>
    /// Gets a name for a tree or an inspector title.
    /// </summary>
    public required string Label { get; init; }

    /// <summary>
    /// Gets where the node's value is in the document.
    /// </summary>
    public required DocumentPath Path { get; init; }

    /// <summary>
    /// Gets the node's value.
    /// </summary>
    public JsonNode? Value { get; init; }

    /// <summary>
    /// Gets the id of the node that holds this one.
    /// </summary>
    public string? ParentId { get; init; }

    /// <summary>
    /// Gets the name of the layout, template, dialog template or screen that physically contains the node.
    /// </summary>
    public required string Owner { get; init; }

    /// <summary>
    /// Gets the kind of node the owner is.
    /// </summary>
    public required SceneNodeKind OwnerKind { get; init; }

    /// <summary>
    /// Gets where the node sits when it is an item of an array: a child list or a slot's content.
    /// </summary>
    public ListLocation? List { get; init; }

    /// <summary>
    /// Gets, for an element held by a flow leaf, the id of that leaf. Removing or moving the element does so to the leaf.
    /// </summary>
    public string? LeafId { get; init; }

    /// <summary>
    /// Gets or sets, for an element positioned freeform, the ids of its placements, one per size-class variant.
    /// </summary>
    public List<string>? PlacementIds { get; set; }

    /// <summary>
    /// Gets, for nodes inside a freeform element, whose content repeats in every size-class variant, the copy this record
    /// describes and where the other copies are. Edits are applied to every copy.
    /// </summary>
    public Mirror? Mirror { get; init; }

    /// <summary>
    /// Gets, for a slot, the name.
    /// </summary>
    public string? SlotName { get; init; }

    /// <summary>
    /// Gets, for a slot, where its content array is (or would be, when empty).
    /// </summary>
    public DocumentPath? ContentPath { get; init; }
}
