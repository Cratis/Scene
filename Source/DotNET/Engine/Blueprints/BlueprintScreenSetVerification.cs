// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Packages;

namespace Cratis.Scene.Engine.Blueprints;

/// <summary>
/// The rules for the ready-to-use screen set of a domain blueprint: named once, titled, built on available templates, parented inside the set and never its own ancestor.
/// </summary>
static class BlueprintScreenSetVerification
{
    /// <summary>
    /// Verifies the screen set of a domain blueprint.
    /// </summary>
    /// <param name="source">The blueprint.</param>
    /// <param name="label">How the blueprint is named in a problem.</param>
    /// <param name="availableTemplates">The names of the screen templates available to it.</param>
    /// <returns>The problems.</returns>
    internal static List<string> Problems(BlueprintSource source, string label, HashSet<string> availableTemplates)
    {
        var set = source.Manifest.Blueprint!.ScreenSet ?? [];
        if (set.Count == 0)
        {
            return [$"{label} declares no ready-to-use screen set"];
        }

        var names = new HashSet<string>(StringComparer.Ordinal);
        var problems = NameProblems(label, set, names);
        var scope = new ScreenSetScope(source, label, names, availableTemplates);
        foreach (var screen in set.Where(screen => !string.IsNullOrWhiteSpace(screen.Name)))
        {
            problems.AddRange(EntryProblems(scope, screen));
        }

        foreach (var screen in set.Where(screen => HasOwnAncestor(screen, names, set)))
        {
            problems.Add($"{label} screen '{screen.Name}' is its own ancestor");
        }

        return problems;
    }

    static List<string> NameProblems(string label, IReadOnlyList<BlueprintScreen> set, HashSet<string> names)
    {
        var problems = new List<string>();
        foreach (var screen in set)
        {
            if (string.IsNullOrWhiteSpace(screen.Name))
            {
                problems.Add($"{label} declares a screen set entry without a name");
                continue;
            }

            if (!names.Add(screen.Name))
            {
                problems.Add($"{label} declares screen '{screen.Name}' more than once");
            }
        }

        return problems;
    }

    static List<string> EntryProblems(ScreenSetScope scope, BlueprintScreen screen)
    {
        var problems = new List<string>();
        var owner = $"{scope.Label} screen '{screen.Name}'";
        if (string.IsNullOrWhiteSpace(screen.Title))
        {
            problems.Add($"{owner} declares no title");
        }

        if (screen.Template is not null && !scope.AvailableTemplates.Contains(screen.Template))
        {
            problems.Add($"{owner} uses template '{screen.Template}', which is not available");
        }

        if (screen.Parent is not null && !scope.Names.Contains(screen.Parent))
        {
            problems.Add($"{owner} has parent '{screen.Parent}', which is not in the screen set");
        }

        if (scope.Source.Screens?.Any(candidate => candidate.Name == screen.Name) == false)
        {
            problems.Add($"{owner} is named in the screen set but the package does not provide it");
        }

        return problems;
    }

    static bool HasOwnAncestor(BlueprintScreen screen, HashSet<string> names, IReadOnlyList<BlueprintScreen> set) =>
        screen.Parent is not null && names.Contains(screen.Parent) && IsOwnAncestor(screen.Name, set);

    static bool IsOwnAncestor(string name, IReadOnlyList<BlueprintScreen> set)
    {
        var visited = new HashSet<string>(StringComparer.Ordinal);
        for (var current = set.FirstOrDefault(screen => screen.Name == name)?.Parent; current is not null; current = set.FirstOrDefault(screen => screen.Name == current)?.Parent)
        {
            if (current == name)
            {
                return true;
            }

            if (!visited.Add(current))
            {
                return false;
            }
        }

        return false;
    }

    sealed record ScreenSetScope(BlueprintSource Source, string Label, HashSet<string> Names, HashSet<string> AvailableTemplates);
}
