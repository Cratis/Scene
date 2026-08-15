// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Elements;

/// <summary>
/// A <see cref="FrameworkElement"/> resolved to a named component from a ui profile's package list rather
/// than a type modeled natively here. Vendor and internal widget libraries (PrimeReact, internal widgets)
/// plug into a renderer through this element — they are adapters, not part of the core vocabulary.
/// </summary>
public record ExternalComponent : FrameworkElement
{
    /// <summary>
    /// Gets the bare or qualified name of the component, resolved against the active ui profile's
    /// package list by the engine.
    /// </summary>
    public required string ComponentName { get; init; }

    /// <summary>
    /// Gets the named content slots passed to the component, each a list of child elements.
    /// </summary>
    public IReadOnlyDictionary<string, IReadOnlyList<SceneElement>> Slots { get; init; } = new Dictionary<string, IReadOnlyList<SceneElement>>();
}
