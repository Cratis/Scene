// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Descriptors;
using Cratis.Scene.Model.Editing;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Says what the properties of a node are, which is what an edit of one of them is checked against.
/// </summary>
static class NodeDescriber
{
    /// <summary>
    /// Describes a node.
    /// </summary>
    /// <param name="record">The node.</param>
    /// <param name="catalog">The descriptors in play.</param>
    /// <returns>The properties the node has, what a layout node can do, and a warning when nothing describes a component.</returns>
    public static NodeDescription Describe(NodeRecord record, DescriptorCatalog catalog)
    {
        var diagnostics = new List<SceneDiagnostic>();
        if (record.Kind == SceneNodeKind.Placement)
        {
            return new(LayoutTypeDescriptors.PlacementProperties, null, diagnostics);
        }

        if (record.Kind is SceneNodeKind.ScreenTemplate or SceneNodeKind.DialogTemplate)
        {
            return new(LayoutTypeDescriptors.TemplateProperties, null, diagnostics);
        }

        if (LayoutTypeOf(record.TypeId) is { } layoutType)
        {
            var descriptor = catalog.FindLayoutType(layoutType);
            return new(descriptor?.Properties ?? [], descriptor?.Capabilities, diagnostics);
        }

        if (record.Kind == SceneNodeKind.Element && Data.Has(record.Value, "componentName"))
        {
            var descriptor = catalog.FindComponent(record.TypeId);
            if (descriptor is null)
            {
                diagnostics.Add(Finding.Warning(
                    DiagnosticCode.MissingComponentDescriptor,
                    $"Nothing describes the component '{record.TypeId}', so none of its properties can be edited.",
                    nodeId: record.Id));
            }

            return new(descriptor?.Properties ?? [], null, diagnostics);
        }

        return new([], null, diagnostics);
    }

    /// <summary>
    /// Gets the layout type a name stands for.
    /// </summary>
    /// <param name="name">The name a document writes a layout type under.</param>
    /// <returns>The layout type, or <see langword="null"/> when the name is not one.</returns>
    public static LayoutType? LayoutTypeOf(string name)
    {
        foreach (var type in Enum.GetValues<LayoutType>())
        {
            if (LayoutTypeNames.Of(type) == name)
            {
                return type;
            }
        }

        return null;
    }
}
