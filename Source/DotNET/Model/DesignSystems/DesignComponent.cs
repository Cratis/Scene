// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// A component of a design system: the parts it is made of and the variants it comes in. A Scene component of the same name
/// (or the one <see cref="ComponentMapping.MapsTo"/> names) renders from this anatomy.
/// </summary>
/// <param name="Name">The component's name (for example <c language="csharp">Button</c>).</param>
/// <param name="Parts">The parts the component uses: <c language="csharp">text</c>, <c language="csharp">background</c>, <c language="csharp">border</c>, <c language="csharp">radius</c>, <c language="csharp">height</c>, <c language="csharp">padding</c>, <c language="csharp">shadow</c> and <c language="csharp">font</c>.</param>
/// <param name="Variants">The variants, each assigning a token role to its parts.</param>
/// <param name="Mapping">How the component links to a Scene component when the name convention is not enough, or <see langword="null"/> to link by name.</param>
public record DesignComponent(
    string Name,
    IReadOnlyList<string> Parts,
    IReadOnlyList<DesignVariant> Variants,
    ComponentMapping? Mapping = null);
