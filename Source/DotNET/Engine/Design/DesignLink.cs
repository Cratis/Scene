// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Design;

/// <summary>
/// The Scene component a design-system component renders, and how a variant reaches it.
/// </summary>
/// <param name="DesignComponent">The design-system component.</param>
/// <param name="Package">The package that provides the Scene component.</param>
/// <param name="Component">The bare name of the Scene component within the package.</param>
/// <param name="VariantProperty">The property a variant is passed in, or <see langword="null"/> when the design-system component has none.</param>
/// <param name="VariantValues">The value each variant takes in that property.</param>
public record DesignLink(
    string DesignComponent,
    string Package,
    string Component,
    string? VariantProperty,
    IReadOnlyDictionary<string, string> VariantValues);
