// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Screens;
using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// The rules for placing the screen templates of a blueprint into the layouts available: placed somewhere, not nested in themselves and, for a domain blueprint, not ambiguous.
/// </summary>
static class BlueprintPlacementVerification
{
    /// <summary>
    /// Verifies that the screen templates of a blueprint are placed.
    /// </summary>
    /// <param name="source">The blueprint.</param>
    /// <param name="library">The other packages available.</param>
    /// <param name="label">How the blueprint is named in a problem.</param>
    /// <param name="domain">Whether the blueprint is a domain blueprint, for which ambiguity is a problem.</param>
    /// <returns>The problems.</returns>
    internal static List<string> Problems(BlueprintSource source, IReadOnlyList<TemplateSource> library, string label, bool domain)
    {
        var own = (source.ScreenTemplates ?? []).Where(template => template.FitsSlot is not null).ToList();
        if (own.Count == 0)
        {
            return [];
        }

        var layouts = (source.Layouts ?? []).Concat(library.SelectMany(other => other.Layouts ?? [])).ToList();
        var everyTemplate = (source.ScreenTemplates ?? []).Concat(library.SelectMany(other => other.ScreenTemplates ?? [])).ToList();
        if (layouts.Count == 0)
        {
            return [$"{label} has no layout to place its screen templates in"];
        }

        var resolutions = layouts.ConvertAll(layout => ScreenTemplateResolver.Resolve(layout, everyTemplate));
        var problems = new List<string>();
        foreach (var template in own.Where(template => !IsPlaced(template, resolutions)))
        {
            problems.AddRange(UnplacedTemplateProblems(template, resolutions, domain));
        }

        return problems;
    }

    static bool IsPlaced(ScreenTemplate template, List<ScreenTemplateResolution> resolutions) =>
        resolutions.Exists(resolution => resolution.Placements.Any(placement => placement.Template == template.Name));

    static List<string> UnplacedTemplateProblems(ScreenTemplate template, List<ScreenTemplateResolution> resolutions, bool domain)
    {
        var unplaced = resolutions.SelectMany(resolution => resolution.Unplaced.Where(candidate => candidate.Template == template.Name)).ToList().Find(candidate => candidate.Candidates.Count > 1);
        if (resolutions.Exists(resolution => resolution.Cycles.Any(cycle => cycle.Contains(template.Name))))
        {
            return [$"Template '{template.Name}' is nested inside itself"];
        }

        if (unplaced is null)
        {
            return [$"Template '{template.Name}' is unplaced: no layout or template declares slot '{template.FitsSlot}'"];
        }

        return domain ? [$"Template '{template.Name}' is ambiguous: slot '{unplaced.Slot}' is declared by {string.Join(", ", unplaced.Candidates)}"] : [];
    }
}
