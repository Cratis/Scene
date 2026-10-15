// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Structure;

namespace Cratis.Scene.Model.Screens;

/// <summary>
/// Semantic and browsing metadata. Category is required for blueprint templates and recommended for own templates. Type and category are open strings so packages can
/// introduce their own vocabulary without a Scene release. Category never determines applicability.
/// </summary>
/// <param name="Type">Semantic role: ApplicationShell, Workspace, List, Detail, Form, Dialog or a custom string.</param>
/// <param name="Category">A package-defined browse category, preserved even when a host does not recognize it.</param>
/// <param name="Scopes">Explicit scope restriction. Null uses the structural role; an empty list allows no scope.</param>
/// <param name="Compatibility">The Scene and package versions the template requires. Required for every shipped template.</param>
/// <param name="Attribution">Who authored the template. Required for every shipped template.</param>
/// <param name="License">The SPDX license identifier the template is available under. Required for every shipped template.</param>
/// <param name="LicenseUrl">An absolute <c language="csharp">https</c> URL to the license terms.</param>
/// <param name="SliceKinds">
/// For a template that applies at <see cref="TemplateScope.Slice"/>, the slice kinds it applies to. Null uses the
/// structural default: a dialog template applies to state change slices, a screen template to every kind that presents something.
/// Declaring slice kinds without scopes makes the default scope <see cref="TemplateScope.Slice"/>.
/// </param>
public record TemplateMetadata(
    string? Type = null,
    string? Category = null,
    IReadOnlyList<TemplateScope>? Scopes = null,
    TemplateCompatibility? Compatibility = null,
    TemplateAttribution? Attribution = null,
    string? License = null,
    string? LicenseUrl = null,
    IReadOnlyList<SliceKind>? SliceKinds = null);
