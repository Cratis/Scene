// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// The ids of the nodes of a document, which are the same as the TypeScript engine gives them.
/// </summary>
static class NodeIds
{
    const char Separator = '#';

    /// <summary>
    /// Gets the id of a layout node.
    /// </summary>
    /// <param name="name">The name of the layout.</param>
    /// <returns>The id.</returns>
    public static string Layout(string name) => $"layout:{name}";

    /// <summary>
    /// Gets the id of a screen template node.
    /// </summary>
    /// <param name="name">The name of the template.</param>
    /// <returns>The id.</returns>
    public static string ScreenTemplate(string name) => $"screenTemplate:{name}";

    /// <summary>
    /// Gets the id of a dialog template node.
    /// </summary>
    /// <param name="name">The name of the dialog template.</param>
    /// <returns>The id.</returns>
    public static string DialogTemplate(string name) => $"dialogTemplate:{name}";

    /// <summary>
    /// Gets the id of a screen node.
    /// </summary>
    /// <param name="name">The name of the screen.</param>
    /// <returns>The id.</returns>
    public static string Screen(string name) => $"screen:{name}";

    /// <summary>
    /// Gets the id of a named slot of a layout, template or screen.
    /// </summary>
    /// <param name="ownerNodeId">The id of the owner.</param>
    /// <param name="slotName">The name of the slot.</param>
    /// <returns>The id.</returns>
    public static string Slot(string ownerNodeId, string slotName) => Child(ownerNodeId, $"slot:{slotName}");

    /// <summary>
    /// Gets the id of an element. Element ids are unique across a document and survive moves.
    /// </summary>
    /// <param name="elementId">The id of the element.</param>
    /// <returns>The id.</returns>
    public static string Element(string elementId) => $"element:{elementId}";

    /// <summary>
    /// Gets the id of the arrangement a layout, template or dialog positions its own slots with.
    /// </summary>
    /// <param name="ownerNodeId">The id of the owner.</param>
    /// <returns>The id.</returns>
    public static string OwnerArrangement(string ownerNodeId) => Child(ownerNodeId, "arrangement");

    /// <summary>
    /// Gets the id of a node of a flow arrangement. A flow node has no identity of its own, so the id is a structural address.
    /// </summary>
    /// <param name="holderId">The slot or owner arrangement the flow belongs to.</param>
    /// <param name="variant"><c language="text">root</c> or <c language="text">override&lt;n&gt;</c>.</param>
    /// <param name="indexPath">The indexes down from that variant's root through each container's children.</param>
    /// <returns>The id.</returns>
    public static string FlowNode(string holderId, string variant, IEnumerable<int> indexPath) =>
        Child(holderId, $"flow:{string.Join('.', new[] { variant }.Concat(indexPath.Select(index => index.ToString(System.Globalization.CultureInfo.InvariantCulture))))}");

    /// <summary>
    /// Gets the id of a freeform arrangement.
    /// </summary>
    /// <param name="holderId">The slot or owner arrangement the freeform belongs to.</param>
    /// <returns>The id.</returns>
    public static string Freeform(string holderId) => Child(holderId, "freeform");

    /// <summary>
    /// Gets the id of one placement within a freeform variant.
    /// </summary>
    /// <param name="holderId">The slot or owner arrangement the freeform belongs to.</param>
    /// <param name="variantIndex">The index of the variant.</param>
    /// <param name="key">The placed element's id, or the placed slot's name.</param>
    /// <returns>The id.</returns>
    public static string Placement(string holderId, int variantIndex, string key) =>
        Child($"{Freeform(holderId)}:{variantIndex}", $"placement:{key}");

    /// <summary>
    /// Gets the node id of the thing an editing scope names.
    /// </summary>
    /// <param name="scope">The scope.</param>
    /// <returns>The id.</returns>
    public static string Scope(EditingScope scope) => scope.Kind switch
    {
        EditingScopeKind.Screen => Screen(scope.Name),
        EditingScopeKind.ScreenTemplate => ScreenTemplate(scope.Name),
        EditingScopeKind.DialogTemplate => DialogTemplate(scope.Name),
        _ => Layout(scope.Name)
    };

    static string Child(string parentId, string segment) => $"{parentId}{Separator}{segment}";
}
