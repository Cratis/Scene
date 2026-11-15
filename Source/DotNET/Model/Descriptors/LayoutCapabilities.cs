// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// What a layout type can do.
/// </summary>
/// <param name="AcceptsChildren">Whether it takes children.</param>
/// <param name="MaximumChildren">The most children it takes, when limited.</param>
/// <param name="ChildPlacement">How it places its children.</param>
/// <param name="SupportsGridSpan">Whether a child may span grid cells.</param>
/// <param name="SupportsSizeClassVariants">Whether it has size-class variants.</param>
/// <param name="ConvertibleTo">The layout types it converts to.</param>
public record LayoutCapabilities(
    bool AcceptsChildren,
    int? MaximumChildren,
    LayoutChildPlacement ChildPlacement,
    bool SupportsGridSpan,
    bool SupportsSizeClassVariants,
    IReadOnlyList<LayoutType> ConvertibleTo);
