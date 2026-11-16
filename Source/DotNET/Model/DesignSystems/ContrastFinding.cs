// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.DesignSystems;

/// <summary>
/// The contrast measured for one pair of parts in one theme and mode, against the ratio a <see cref="ContrastRule"/> asks for.
/// A finding below its required ratio is a problem to show; one at or above it is the evidence the rule holds.
/// </summary>
/// <param name="Theme">The theme.</param>
/// <param name="Mode">The mode.</param>
/// <param name="Component">The component.</param>
/// <param name="Variant">The variant.</param>
/// <param name="State">The state, or <see langword="null"/> for the variant's own parts.</param>
/// <param name="Foreground">The foreground part.</param>
/// <param name="Background">The background part.</param>
/// <param name="Ratio">The measured WCAG contrast ratio.</param>
/// <param name="Required">The ratio the rule asks for.</param>
public record ContrastFinding(
    string Theme,
    string Mode,
    string Component,
    string Variant,
    string? State,
    string Foreground,
    string Background,
    double Ratio,
    double Required);
