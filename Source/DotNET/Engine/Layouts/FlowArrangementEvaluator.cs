// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Layouts;
using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Engine.Layouts;

/// <summary>
/// Evaluates a <see cref="FlowArrangement"/> for a given <see cref="SizeClass"/> - part of Cratis/Scene#4.
/// </summary>
public static class FlowArrangementEvaluator
{
    /// <summary>
    /// Selects the <see cref="FlowNode"/> tree that applies for a given <see cref="SizeClass"/>.
    /// </summary>
    /// <param name="arrangement">The <see cref="FlowArrangement"/> to evaluate.</param>
    /// <param name="sizeClass">The current <see cref="SizeClass"/>.</param>
    /// <returns>
    /// The most specific matching <see cref="FlowOverride.Root"/> (both dimensions targeted beats one; the
    /// last declared wins among equally specific matches), or <see cref="FlowArrangement.Root"/> when no
    /// override matches.
    /// </returns>
    public static FlowNode Evaluate(FlowArrangement arrangement, SizeClass sizeClass)
    {
        FlowOverride? best = null;
        foreach (var candidate in arrangement.Overrides ?? [])
        {
            if (!Matches(candidate, sizeClass))
            {
                continue;
            }

            if (best is null || Specificity(candidate) >= Specificity(best))
            {
                best = candidate;
            }
        }

        return best?.Root ?? arrangement.Root;
    }

    static bool Matches(FlowOverride @override, SizeClass sizeClass) =>
        (@override.Width is null || @override.Width == sizeClass.Width) &&
        (@override.Height is null || @override.Height == sizeClass.Height);

    static int Specificity(FlowOverride @override) =>
        (@override.Width is not null ? 1 : 0) + (@override.Height is not null ? 1 : 0);
}
