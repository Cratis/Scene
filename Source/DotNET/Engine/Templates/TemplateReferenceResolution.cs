// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Templates;

/// <summary>
/// The result of resolving a template reference.
/// </summary>
/// <param name="Status">Whether and how the reference resolved.</param>
/// <param name="Package">The package providing the template, when it was found or its blueprint was.</param>
/// <param name="PackageVersion">The installed version of that package.</param>
/// <param name="Kind">Which kind of template was found, when <paramref name="Status"/> is <see cref="TemplateReferenceStatus.Resolved"/>.</param>
/// <param name="Message">A diagnostic when the reference did not resolve, otherwise <see langword="null"/>.</param>
public record TemplateReferenceResolution(
    TemplateReferenceStatus Status,
    string? Package = null,
    string? PackageVersion = null,
    TemplateCatalogKind? Kind = null,
    string? Message = null);
