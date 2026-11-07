// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Navigation;

namespace Cratis.Scene.Engine.Outlets;

/// <summary>
/// Builds the chain of outlet levels a screen's outlets resolve through, so no host assembles it itself. The chain is, from
/// the top down: the application level of the navigation model, the screen's layout, its screen template, a level for each
/// module and feature of the screen's path (the first a module, the rest features; a module's navigation refinements and
/// contributions and the host's level of that name join it), and the screen with its outlet contributions. Every other
/// screen's outlet contributions, every other module's navigation contributions and every host level not on the path
/// contribute. Pass the result to <see cref="EffectiveOutlets.Resolve"/>. The TypeScript engine's
/// <c language="typescript">outletChainOf</c> builds the same chain; both are asserted against
/// <c language="json">outlet-resolution-fixtures.json</c>.
/// </summary>
public static class OutletChains
{
    /// <summary>
    /// Builds the chain of a screen.
    /// </summary>
    /// <param name="source">The document, navigation model and host levels to build from.</param>
    /// <param name="screen">The name of the screen.</param>
    /// <returns>The chain and its contributors; both empty when there is no such screen.</returns>
    public static OutletChain Of(OutletChainSource source, string screen)
    {
        var target = (source.Screens ?? []).FirstOrDefault(candidate => candidate.Name == screen);
        if (target is null) return new([], []);

        var chain = new List<OutletLevel>();
        if (source.Navigation is not null) chain.Add(NavigationOutlets.Levels(source.Navigation)[0]);

        var layout = (source.Layouts ?? []).FirstOrDefault(candidate => candidate.Name == target.Layout);
        if (layout is not null) chain.Add(new(OutletLevelKind.Layout, layout.Name, layout.Outlets));

        var template = target.ScreenTemplate is null ? null : (source.ScreenTemplates ?? []).FirstOrDefault(candidate => candidate.Name == target.ScreenTemplate);
        if (template is not null) chain.Add(new(OutletLevelKind.Template, template.Name, template.Outlets));

        var path = target.Path;
        for (var index = 0; index < path.Count; index++)
        {
            var name = path[index];
            var kind = index == 0 ? OutletLevelKind.Module : OutletLevelKind.Feature;
            var module = index == 0 ? source.Navigation?.Modules.FirstOrDefault(candidate => candidate.Module == name) : null;
            var parts = new List<OutletLevel>();
            if (module is not null) parts.Add(new(kind, name, Refinements: module.Refinements, Contributions: module.Contributions));
            parts.AddRange((source.Levels ?? []).Where(candidate => candidate.Name == name));
            chain.Add(Merged(kind, name, parts));
        }

        chain.Add(new(OutletLevelKind.Screen, target.Name, Contributions: target.OutletContributions));

        var contributors = new List<OutletLevel>();
        contributors.AddRange((source.Screens ?? [])
            .Where(candidate => !ReferenceEquals(candidate, target) && (candidate.OutletContributions ?? []).Count > 0)
            .Select(candidate => new OutletLevel(OutletLevelKind.Screen, candidate.Name, Contributions: candidate.OutletContributions)));
        contributors.AddRange((source.Navigation?.Modules ?? [])
            .Where(candidate => (path.Count == 0 || candidate.Module != path[0]) && (candidate.Contributions ?? []).Count > 0)
            .Select(candidate => new OutletLevel(OutletLevelKind.Module, candidate.Module, Contributions: candidate.Contributions)));
        contributors.AddRange((source.Levels ?? []).Where(candidate => !path.Contains(candidate.Name)));

        return new(chain, contributors);
    }

    static OutletLevel Merged(OutletLevelKind kind, string name, List<OutletLevel> parts)
    {
        var outlets = parts.SelectMany(part => part.Outlets ?? []).ToList();
        var refinements = parts.SelectMany(part => part.Refinements ?? []).ToList();
        var contributions = parts.SelectMany(part => part.Contributions ?? []).ToList();
        return new(
            kind,
            name,
            outlets.Count > 0 ? outlets : null,
            refinements.Count > 0 ? refinements : null,
            contributions.Count > 0 ? contributions : null);
    }
}
