// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// One component a profile's packages contribute.
/// </summary>
/// <param name="Name">The id an element names as its <c language="text">componentName</c>.</param>
/// <param name="Label">What it is called.</param>
/// <param name="Category">The category it is listed under.</param>
/// <param name="Placement">Where it may be placed.</param>
/// <param name="Properties">Its properties.</param>
/// <param name="Fits">The outlets that take it, as <c language="text">Template.outlet</c>.</param>
/// <param name="Package">The package it comes from.</param>
/// <param name="Description">What it is for.</param>
/// <param name="Anatomy">What the design system lets it look like.</param>
public record DesignComponentEntry(
    string Name,
    string Label,
    string Category,
    DesignPlacement Placement,
    IReadOnlyList<DesignPropertyEntry> Properties,
    IReadOnlyList<string> Fits,
    string? Package = null,
    string? Description = null,
    DesignAnatomyEntry? Anatomy = null);
