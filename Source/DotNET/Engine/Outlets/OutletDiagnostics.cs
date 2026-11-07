// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// Checks every outlet of a chain of levels. The TypeScript engine's <c language="typescript">diagnoseOutlets</c> reports the same.
/// </summary>
public static class OutletDiagnostics
{
    /// <summary>
    /// Checks what resolving each declared outlet reports, then every refinement of an outlet no level above it declares and
    /// every contribution to an outlet no level declares.
    /// </summary>
    /// <param name="chain">The levels from the top down; the last is the level the outlets are checked for.</param>
    /// <param name="contributors">Levels outside the chain that may contribute to its outlets.</param>
    /// <returns>The diagnostics: per declared outlet in declaration order, then refinements, then contributions.</returns>
    public static IReadOnlyList<OutletDiagnostic> Diagnose(IReadOnlyList<OutletLevel> chain, IReadOnlyList<OutletLevel>? contributors = null)
    {
        var declared = new List<string>();
        foreach (var outlet in chain.SelectMany(level => level.Outlets ?? []))
        {
            if (!declared.Contains(outlet.Name)) declared.Add(outlet.Name);
        }
        var diagnostics = declared.SelectMany(outlet => EffectiveOutlets.Resolve(chain, outlet, contributors).Diagnostics).ToList();

        var declaredAbove = new HashSet<string>(StringComparer.Ordinal);
        foreach (var level in chain)
        {
            diagnostics.AddRange((level.Refinements ?? [])
                .Where(refinement => !declaredAbove.Contains(refinement.Outlet))
                .Select(refinement => OutletProblems.RefinementOfUnknownOutlet(refinement.Outlet, level.Name)));
            foreach (var outlet in level.Outlets ?? []) declaredAbove.Add(outlet.Name);
        }

        diagnostics.AddRange(chain.Concat(contributors ?? [])
            .SelectMany(level => (level.Contributions ?? [])
                .Where(contribution => !declared.Contains(contribution.Outlet))
                .Select(contribution => OutletProblems.ContributionToUnknownOutlet(contribution.Outlet, level.Name))));
        return diagnostics;
    }
}
