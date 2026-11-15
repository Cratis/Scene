// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Descriptors;

namespace Cratis.Scene.Engine.Editing.Applying;

/// <summary>
/// Everything an editor knows how to describe: the component descriptors packages contribute, and the layout types the model
/// itself defines. It is a derived view over what packages ship - not a registry anything registers into.
/// </summary>
/// <param name="Components">The descriptors of the components in play.</param>
/// <param name="LayoutTypes">The descriptors of the layout types in play.</param>
public sealed record DescriptorCatalog(IReadOnlyList<ComponentDescriptor> Components, IReadOnlyList<LayoutTypeDescriptor> LayoutTypes)
{
    /// <summary>
    /// Builds a catalog from the component descriptors of the active packages, plus the built-in layout types. When two descriptors
    /// name the same component the later one wins, which is the same override-priority rule the profile's package order already
    /// means for components.
    /// </summary>
    /// <param name="componentDescriptors">The component descriptors, in package order.</param>
    /// <returns>The catalog.</returns>
    public static DescriptorCatalog Create(IEnumerable<ComponentDescriptor>? componentDescriptors = null)
    {
        var byComponent = new Dictionary<string, ComponentDescriptor>(StringComparer.Ordinal);
        foreach (var descriptor in componentDescriptors ?? [])
        {
            byComponent[descriptor.Component] = descriptor;
        }

        return new([.. byComponent.Values], LayoutTypeDescriptors.All);
    }

    /// <summary>
    /// Finds the descriptor of a component by the name an element carries. An exact match wins. Otherwise a bare name
    /// (<c language="text">dataTable</c>) finds the one descriptor whose component ends in <c language="text">:dataTable</c>; a bare
    /// name that several packages describe has no single answer, so it finds none.
    /// </summary>
    /// <param name="componentName">The name an element carries.</param>
    /// <returns>The descriptor, or <see langword="null"/> when there is none or it is ambiguous.</returns>
    public ComponentDescriptor? FindComponent(string componentName)
    {
        var exact = Components.FirstOrDefault(descriptor => descriptor.Component == componentName);
        if (exact is not null)
        {
            return exact;
        }

        var matches = Components.Where(descriptor => descriptor.Component.EndsWith($":{componentName}", StringComparison.Ordinal)).ToList();
        return matches.Count == 1 ? matches[0] : null;
    }

    /// <summary>
    /// Finds the descriptor of a layout type.
    /// </summary>
    /// <param name="type">The layout type.</param>
    /// <returns>The descriptor, or <see langword="null"/> when there is none.</returns>
    public LayoutTypeDescriptor? FindLayoutType(LayoutType type) => LayoutTypes.FirstOrDefault(descriptor => descriptor.Type == type);
}
