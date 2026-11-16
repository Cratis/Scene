// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Catalogue;
using Cratis.Scene.Design.ScreenSets;
using Cratis.Scene.Screenplay.DesignSystems;
using Cratis.Scene.Screenplay.Forward;
using Cratis.Screenplay;

namespace Cratis.Scene.Design.AI.Turns;

/// <summary>
/// What a host knows that a design turn is grounded in.
/// </summary>
/// <param name="Catalogue">What the catalogue is built from: the design system, themes, the profile, the component descriptors of its packages, the screen templates and, where the screens are bound to a model, its shapes, queries and commands.</param>
/// <param name="Screenplay">The Screenplay of the application the screens are designed for - its design system, themes, layouts, screen templates and ui profile, and the model the screens may name. The screens a turn writes are compiled together with it.</param>
/// <param name="DesignSystemVersion">The version of the design system the turn designs against, recorded on every revision it makes.</param>
/// <param name="Notes">What the host tells the model about this design: a slice a prototype is scoped to, the story the screens are for.</param>
/// <param name="Storylines">The storylines of the design the host keeps beyond the default one, which follows the screens.</param>
public record DesignHostContext(
    DesignCatalogueInput Catalogue,
    string Screenplay,
    string DesignSystemVersion = "",
    string? Notes = null,
    IReadOnlyList<Storyline>? Storylines = null)
{
    /// <summary>
    /// Creates the context of an application from its Screenplay, taking what the catalogue holds of the application - the design system with its
    /// themes, and the ui profile - from there when the input does not carry it.
    /// </summary>
    /// <param name="input">What the host knows of the catalogue: component descriptors, screen templates, outlet rules, the model.</param>
    /// <param name="screenplay">The Screenplay of the application.</param>
    /// <param name="designSystemVersion">The version of the design system.</param>
    /// <param name="notes">What the host tells the model about the design.</param>
    /// <param name="storylines">The host's storylines.</param>
    /// <returns>The context.</returns>
    public static DesignHostContext FromScreenplay(DesignCatalogueInput input, string screenplay, string designSystemVersion = "", string? notes = null, IReadOnlyList<Storyline>? storylines = null)
    {
        var compilation = new ScreenplayCompiler().Compile(screenplay);
        if (compilation.Value is not { } application)
        {
            return new(input, screenplay, designSystemVersion, notes, storylines);
        }

        var designSystem = input.DesignSystem ?? DesignSystemConverter.Convert(application);
        var scene = SceneTranslation.Translate(compilation).Value;
        var catalogue = input with
        {
            DesignSystem = designSystem,
            Themes = input.Themes ?? (scene?.Themes.Count > 0 ? scene.Themes : null),
            Profile = input.Profile ?? scene?.UiProfiles[0],
        };
        return new(catalogue, screenplay, designSystemVersion, notes, storylines);
    }
}
