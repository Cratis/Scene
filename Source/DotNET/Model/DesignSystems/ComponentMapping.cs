// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// An explicit link between a design-system component and a Scene component, overriding the name convention. The design system
/// states it with <c language="csharp">maps to &lt;Package.Component&gt;</c> and a variant-to-property mapping.
/// </summary>
/// <param name="MapsTo">The package-qualified Scene component the design-system component renders (for example <c language="csharp">PrimeReact.button</c>), or <see langword="null"/> to link by name.</param>
/// <param name="VariantProperty">The property of the Scene component a variant feeds, or <see langword="null"/> for the well-known one (<c language="csharp">variant</c>, else <c language="csharp">emphasis</c>).</param>
/// <param name="VariantValues">Per variant name, the value the property takes when it differs from the variant's name, or <see langword="null"/> when each variant's name is the value.</param>
public record ComponentMapping(
    string? MapsTo = null,
    string? VariantProperty = null,
    IReadOnlyDictionary<string, string>? VariantValues = null);
