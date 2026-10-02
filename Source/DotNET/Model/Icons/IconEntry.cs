// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Icons;

/// <summary>
/// One icon in an icon library's catalog: what a picker needs to find it and a reference needs to name it.
/// Metadata only - no SVG, class name or component, which are the renderer's concern.
/// </summary>
/// <param name="Key">The stable key within the library; what an <see cref="IconReference"/> persists.</param>
/// <param name="Name">The display name a picker shows. Never identity.</param>
/// <param name="Categories">The categories the icon is filed under, for browsing.</param>
/// <param name="Aliases">Alternative names to find the icon by.</param>
/// <param name="Tags">Free-form search terms.</param>
/// <param name="Variants">The variants this icon exists in; <see langword="null"/> or empty when it has none.</param>
public record IconEntry(
    string Key,
    string Name,
    IReadOnlyList<string> Categories,
    IReadOnlyList<string>? Aliases = null,
    IReadOnlyList<string>? Tags = null,
    IReadOnlyList<string>? Variants = null);
