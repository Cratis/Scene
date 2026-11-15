// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.RegularExpressions;

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// Finds things in a catalogue, and decides which outlets take which components.
/// </summary>
public static partial class DesignCatalogueLookup
{
    /// <summary>
    /// Whether an outlet takes a component: one that may be placed, and is named by the outlet or in a category it takes - or any, for an open outlet.
    /// </summary>
    /// <param name="outlet">The outlet.</param>
    /// <param name="component">The component.</param>
    /// <returns>True when the outlet takes it.</returns>
    public static bool Accepts(DesignOutletRule outlet, DesignComponentEntry component) =>
        component.Placement == DesignPlacement.Outlet && (outlet.Open || outlet.Components.Contains(component.Name) || outlet.Categories.Contains(component.Category));

    /// <summary>
    /// Gets the outlets of a template that take a component.
    /// </summary>
    /// <param name="outlets">The outlets.</param>
    /// <param name="component">The component.</param>
    /// <returns>The names of the outlets that take it.</returns>
    public static IReadOnlyList<string> HomesOf(IEnumerable<DesignOutletRule> outlets, DesignComponentEntry component) =>
        [.. outlets.Where(outlet => Accepts(outlet, component)).Select(outlet => outlet.Name)];

    /// <summary>
    /// Finds a component by its id, else by its bare name when exactly one component has it.
    /// </summary>
    /// <param name="catalogue">The catalogue.</param>
    /// <param name="name">The id or bare name.</param>
    /// <returns>The component, or null.</returns>
    public static DesignComponentEntry? FindComponent(DesignCatalogue catalogue, string name)
    {
        var exact = catalogue.Components.FirstOrDefault(component => component.Name == name);
        if (exact is not null)
        {
            return exact;
        }

        var wanted = Normalize(name);
        var matches = catalogue.Components
            .Where(component => Normalize(component.Name[(component.Name.LastIndexOf(':') + 1)..]) == wanted || Normalize(component.Label) == wanted)
            .ToList();
        return matches.Count == 1 ? matches[0] : null;
    }

    /// <summary>
    /// Finds a template by name.
    /// </summary>
    /// <param name="catalogue">The catalogue.</param>
    /// <param name="name">The template's name.</param>
    /// <returns>The template, or null.</returns>
    public static DesignTemplateEntry? FindTemplate(DesignCatalogue catalogue, string name) =>
        catalogue.Templates.FirstOrDefault(template => template.Name == name);

    static string Normalize(string name) => Separators().Replace(name.ToLowerInvariant(), string.Empty);

    [GeneratedRegex(@"[\s._:-]", RegexOptions.CultureInvariant | RegexOptions.ExplicitCapture, matchTimeoutMilliseconds: 1000)]
    private static partial Regex Separators();
}
