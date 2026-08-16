// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// A named token/styling layer, declaring which component packages it is known to work with. An
/// incompatible theme/package pairing is a warning, not an error - the theme might still work by
/// coincidence, but the gap must be visible.
/// </summary>
/// <param name="Name">The theme's name.</param>
/// <param name="CompatibleWith">The component packages this theme is declared compatible with.</param>
/// <param name="Tokens">
/// The theme's design tokens, keyed by semantic name (<c>primary.color</c>, <c>surface.background</c>,
/// <c>content.borderColor</c>, ...). Deliberately semantic rather than CSS: a renderer decides how a token
/// becomes a custom property, a native style, or anything else. Empty for a theme a package applies by
/// its own means rather than through tokens.
/// </param>
/// <param name="IsDark">Whether the theme is a dark scheme, so a picker can group and preview it correctly.</param>
/// <param name="Author">
/// Who created the theme. A theme adopted from somewhere else - PrimeTek's free presets, a community
/// theme - must credit its original creator here rather than appear to be ours.
/// </param>
/// <param name="AuthorUrl">A link to the original creator or the theme's home, shown alongside <paramref name="Author"/>.</param>
/// <param name="License">The license the theme is used under, so redistributing it stays honest.</param>
/// <param name="Description">A one-line description for a theme picker.</param>
public record Theme(
    string Name,
    IReadOnlyList<string> CompatibleWith,
    IReadOnlyDictionary<string, string>? Tokens = null,
    bool IsDark = false,
    string? Author = null,
    string? AuthorUrl = null,
    string? License = null,
    string? Description = null);
