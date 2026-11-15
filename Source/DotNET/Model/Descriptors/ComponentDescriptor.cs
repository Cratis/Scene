// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.DesignSystems;
using Cratis.Scene.Model.Icons;

namespace Cratis.Scene.Model.Descriptors;

/// <summary>
/// Describes one component a package contributes.
/// </summary>
/// <param name="Component">The id of the component.</param>
/// <param name="Properties">Its properties.</param>
/// <param name="DisplayName">What the author sees.</param>
/// <param name="Description">What it is for.</param>
/// <param name="Category">The category it is listed under.</param>
/// <param name="Icon">Its icon.</param>
/// <param name="Badge">A short mark shown with it.</param>
/// <param name="Keywords">Words it is found by.</param>
/// <param name="DesignMode">How it is designed in place.</param>
/// <param name="EditorKind">The editor to use.</param>
/// <param name="Actions">What may be done to it while designing.</param>
/// <param name="PreviewKind">The preview to use.</param>
/// <param name="PropertyDisplayKind">How its properties are shown.</param>
/// <param name="Anatomy">The parts, variants and states of its look that a design system can restyle.</param>
public record ComponentDescriptor(
    string Component,
    IReadOnlyList<PropertyDescriptor> Properties,
    string? DisplayName = null,
    string? Description = null,
    string? Category = null,
    IconReference? Icon = null,
    string? Badge = null,
    IReadOnlyList<string>? Keywords = null,
    ComponentDesignModeDescriptor? DesignMode = null,
    string? EditorKind = null,
    IReadOnlyList<DesignTimeActionDescriptor>? Actions = null,
    string? PreviewKind = null,
    string? PropertyDisplayKind = null,
    ComponentAnatomy? Anatomy = null);
