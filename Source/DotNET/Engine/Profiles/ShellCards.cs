// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Engine.Templates;
using Cratis.Scene.Model.Screens;

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Describes the shells a designer offers as cards. The TypeScript twin is <c language="csharp">describeShellCards</c>.
/// </summary>
public static class ShellCards
{
    /// <summary>
    /// Describes the shells a designer offers as cards, from the metadata they carry - a shell is offered when it declares a default menu mode.
    /// A shell that declares none (a full-page shell without a menu) is not a card.
    /// </summary>
    /// <param name="library">The application's own templates and the blueprints that are available.</param>
    /// <returns>The cards: the application's own first, then each blueprint's, in the order they are declared.</returns>
    public static IReadOnlyList<ShellCard> Describe(TemplateLibrary library)
    {
        var cards = new List<ShellCard>();
        var sources = new List<(TemplateSource? Source, string Blueprint)> { (library.Own, string.Empty) };
        sources.AddRange(library.Blueprints.Select(source => ((TemplateSource?)source, source.Manifest.Name)));
        foreach (var (source, blueprint) in sources)
        {
            if (source is null)
            {
                continue;
            }

            foreach (var layout in source.Layouts ?? [])
            {
                Add(cards, blueprint, layout.Name, layout.Metadata, null, null);
            }

            foreach (var template in (source.ScreenTemplates ?? []).Where(template => template.Metadata?.Role == TemplateRole.Root))
            {
                Add(cards, blueprint, template.Name, template.Metadata, template.DisplayName, template.Description);
            }
        }

        return cards;
    }

    static void Add(List<ShellCard> cards, string blueprint, string name, TemplateMetadata? metadata, string? displayName, string? description)
    {
        var mode = ShellOptions.Normalize(metadata?.DefaultMenuMode);
        if (mode is null)
        {
            return;
        }

        cards.Add(new ShellCard(blueprint, name, metadata?.DisplayName ?? displayName ?? name, metadata?.Description ?? description ?? string.Empty, metadata?.Thumbnail ?? string.Empty, mode.Value));
    }
}
