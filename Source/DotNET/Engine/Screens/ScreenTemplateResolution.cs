// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Screens;

/// <summary>
/// The outcome of working out how a blueprint's templates nest inside its layout.
/// </summary>
/// <param name="Placements">Every template that found exactly one home, ordered shallowest first so a caller can build the tree top-down.</param>
/// <param name="Unplaced">
/// Templates that found none or several. Reported rather than guessed: placing a template in the wrong parent
/// renders content in the wrong region, which is far harder to diagnose than being told the slot name is
/// ambiguous.
/// </param>
/// <param name="Cycles">
/// Template nesting cycles - a template that transitively contains itself. Its members are reported and left
/// out of <see cref="Placements"/>, since no depth can be assigned to them.
/// </param>
public record ScreenTemplateResolution(
    IReadOnlyList<ScreenTemplatePlacement> Placements,
    IReadOnlyList<UnplacedScreenTemplate> Unplaced,
    IReadOnlyList<IReadOnlyList<string>> Cycles)
{
    /// <summary>
    /// Whether every template found exactly one home and nothing nests inside itself.
    /// </summary>
    public bool IsValid => Unplaced.Count == 0 && Cycles.Count == 0;
}
