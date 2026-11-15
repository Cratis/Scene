// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// The look a component can take from a design system: the parts it draws, the variants it comes in and the states it reacts to.
/// </summary>
/// <remarks>
/// A component reads its look from anatomy - "my <c language="csharp">primary</c> variant's <c language="csharp">background</c> in <c language="csharp">hover</c>" - and never
/// from a token name, so any design system that declares the same component can restyle it. The engine checks a design system against this declaration and reports every
/// part, variant or state the component cannot render; nothing is dropped silently.
/// </remarks>
/// <param name="Parts">The parts the component draws: <c language="csharp">text</c>, <c language="csharp">background</c>, <c language="csharp">border</c>, <c language="csharp">radius</c>, <c language="csharp">height</c>, <c language="csharp">padding</c>, <c language="csharp">shadow</c> or <c language="csharp">font</c>.</param>
/// <param name="Variants">The variants the component renders. Empty for a component with a single look.</param>
/// <param name="States">The states the component reacts to: <c language="csharp">hover</c>, <c language="csharp">focus</c>, <c language="csharp">active</c>, <c language="csharp">disabled</c> or <c language="csharp">selected</c>.</param>
/// <param name="VariantProperty">The property that chooses the variant, or <see langword="null"/> for the well-known one - <c language="csharp">variant</c>, else <c language="csharp">emphasis</c>, whichever the component declares as a property.</param>
public record ComponentAnatomy(
    IReadOnlyList<string> Parts,
    IReadOnlyList<string> Variants,
    IReadOnlyList<string> States,
    string? VariantProperty = null);
