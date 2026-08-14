// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Profiles;

/// <summary>
/// A named token/styling layer, declaring which component packages it is known to work with. An
/// incompatible theme/package pairing is a warning, not an error — the theme might still work by
/// coincidence, but the gap must be visible. The token model's own shape (colors, spacing, typography)
/// is intentionally out of scope here — <see cref="CompatibleWith"/> is what the engine and Stage's build
/// need to validate compatibility; applying tokens is a renderer concern.
/// </summary>
/// <param name="Name">The theme's name.</param>
/// <param name="CompatibleWith">The component packages this theme is declared compatible with.</param>
public record Theme(string Name, IReadOnlyList<string> CompatibleWith);
