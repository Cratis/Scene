// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Catalogue;

/// <summary>
/// Answers questions from a catalogue.
/// </summary>
public static class DesignCatalogueQueries
{
    /// <summary>
    /// Answers a question from the catalogue; the answer never contains anything the catalogue does not list.
    /// </summary>
    /// <param name="catalogue">The catalogue.</param>
    /// <param name="query">The question.</param>
    /// <returns>The answer.</returns>
    public static DesignCatalogueAnswer Answer(DesignCatalogue catalogue, DesignCatalogueQuery query) => query.What switch
    {
        "components" => List(Components(catalogue, query)),
        "component" => One(DesignCatalogueLookup.FindComponent(catalogue, query.Name ?? string.Empty)),
        "templates" => List(catalogue.Templates.Select(template => new { template.Name, template.DisplayName, template.Type, Outlets = template.Outlets.Select(outlet => outlet.Name).ToList() })),
        "template" => One(DesignCatalogueLookup.FindTemplate(catalogue, query.Name ?? string.Empty)),
        "tokens" => List(catalogue.Tokens.Where(token => query.Category is null || token.Category == query.Category).Select(token => new { token.Address, token.Description })),
        "token" => One(catalogue.Tokens.FirstOrDefault(token => token.Address == query.Address)),
        "designComponents" => List(catalogue.DesignComponents.Select(component => new { component.Name, Variants = component.Variants.Select(variant => variant.Name).ToList(), component.BoundTo })),
        "designComponent" => One(catalogue.DesignComponents.FirstOrDefault(component => component.Name == query.Name)),
        "themes" => List(catalogue.Themes),
        "profile" => One(catalogue.Profile),
        "words" => One(catalogue.Words),
        "shapes" => List(catalogue.Shapes.Select(shape => new { shape.Name, shape.Source })),
        "shape" => One(catalogue.Shapes.FirstOrDefault(shape => shape.Name == query.Name)),
        "queries" => List(catalogue.Queries.Select(entry => new { entry.Id, entry.Name })),
        "query" => One(catalogue.Queries.FirstOrDefault(entry => entry.Name == query.Name || entry.Id == query.Name)),
        "commands" => List(catalogue.Commands.Select(entry => new { entry.Id, entry.Name })),
        "command" => One(catalogue.Commands.FirstOrDefault(entry => entry.Name == query.Name || entry.Id == query.Name)),
        _ => new DesignCatalogueAnswer(false),
    };

    static DesignCatalogueAnswer List<T>(IEnumerable<T> items) => new(true, [.. items.Cast<object>()]);

    static DesignCatalogueAnswer One(object? item) => item is null ? new(false) : new(true, null, item);

    static IEnumerable<object> Components(DesignCatalogue catalogue, DesignCatalogueQuery query)
    {
        bool Fits(string fit) =>
            fit.StartsWith($"{query.FitsTemplate}.", StringComparison.Ordinal) && (query.FitsOutlet is null || fit == $"{query.FitsTemplate}.{query.FitsOutlet}");

        return catalogue.Components
            .Where(component =>
                (query.Category is null || component.Category == query.Category) &&
                (query.FitsTemplate is null || component.Fits.Any(Fits)) &&
                (query.Search is null || Matches(component.Name, query.Search) || Matches(component.Label, query.Search) || Matches(component.Description, query.Search)))
            .Select(component => new { component.Name, component.Label, component.Category, component.Placement });
    }

    static bool Matches(string? value, string search) => (value ?? string.Empty).Contains(search, StringComparison.OrdinalIgnoreCase);
}
