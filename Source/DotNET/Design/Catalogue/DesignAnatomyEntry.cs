// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// What a design system lets a component look like: only the variants, states and parts both sides declare.
/// </summary>
/// <param name="Parts">The parts it draws.</param>
/// <param name="Variants">The variants it comes in.</param>
/// <param name="States">The states it reacts to.</param>
/// <param name="VariantProperty">The property that chooses the variant.</param>
/// <param name="DesignSystemComponent">The design system's component this one is bound to, when there is one.</param>
public record DesignAnatomyEntry(
    IReadOnlyList<string> Parts,
    IReadOnlyList<string> Variants,
    IReadOnlyList<string> States,
    string? VariantProperty = null,
    string? DesignSystemComponent = null);
