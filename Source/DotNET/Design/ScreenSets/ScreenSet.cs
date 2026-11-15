// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.ScreenSets;

/// <summary>
/// The screens of a design, in order, and the storylines through them. The default storyline lists every screen in screen order: it is kept that way as
/// screens are added, removed and reordered. Other storylines are the author's; a removed screen leaves them.
/// </summary>
/// <param name="Screens">The screens, in order.</param>
/// <param name="Storylines">The storylines, the default one first.</param>
/// <param name="DefaultStoryline">The name of the storyline kept in screen order.</param>
public record ScreenSet(IReadOnlyList<string> Screens, IReadOnlyList<Storyline> Storylines, string DefaultStoryline)
{
    /// <summary>
    /// The name of the storyline a screen set keeps in screen order.
    /// </summary>
    public const string DefaultStorylineName = "Default";

    /// <summary>
    /// Creates a set of the given screens, in that order, with its default storyline walking them.
    /// </summary>
    /// <param name="screens">The screens.</param>
    /// <returns>The set.</returns>
    public static ScreenSet Create(IEnumerable<string>? screens = null) =>
        WithDefaultStoryline(new ScreenSet([.. (screens ?? []).Distinct()], [], DefaultStorylineName));

    /// <summary>
    /// Adds a screen at a position - the end when none is given. A screen already in the set stays where it is.
    /// </summary>
    /// <param name="name">The screen.</param>
    /// <param name="index">The position.</param>
    /// <returns>The new set.</returns>
    public ScreenSet AddScreen(string name, int? index = null)
    {
        if (Screens.Contains(name))
        {
            return this;
        }

        var position = index is null ? Screens.Count : Math.Max(0, Math.Min(Screens.Count, index.Value));
        return WithDefaultStoryline(this with { Screens = [.. Screens.Take(position), name, .. Screens.Skip(position)] });
    }

    /// <summary>
    /// Removes a screen from the set, from the default storyline and from every storyline of the author's.
    /// </summary>
    /// <param name="name">The screen.</param>
    /// <returns>The new set.</returns>
    public ScreenSet RemoveScreen(string name)
    {
        if (!Screens.Contains(name))
        {
            return this;
        }

        return WithDefaultStoryline(this with
        {
            Screens = [.. Screens.Where(screen => screen != name)],
            Storylines = [.. Storylines.Select(storyline => storyline with { Steps = [.. storyline.Steps.Where(step => step != name)] })],
        });
    }

    /// <summary>
    /// Moves a screen to a position, clamped to the set; the default storyline follows.
    /// </summary>
    /// <param name="name">The screen.</param>
    /// <param name="index">The position.</param>
    /// <returns>The new set.</returns>
    public ScreenSet MoveScreen(string name, int index)
    {
        if (!Screens.Contains(name))
        {
            return this;
        }

        var rest = Screens.Where(screen => screen != name).ToList();
        var position = Math.Max(0, Math.Min(rest.Count, index));
        return WithDefaultStoryline(this with { Screens = [.. rest.Take(position), name, .. rest.Skip(position)] });
    }

    /// <summary>
    /// Adds an author's storyline, or replaces the one of that name. Steps that name no screen of the set are dropped. The default storyline is not the author's to change.
    /// </summary>
    /// <param name="storyline">The storyline.</param>
    /// <returns>The new set.</returns>
    public ScreenSet WithStoryline(Storyline storyline)
    {
        if (storyline.Name == DefaultStoryline)
        {
            return this;
        }

        var kept = storyline with { Steps = [.. storyline.Steps.Where(Screens.Contains)] };
        var exists = Storylines.Any(candidate => candidate.Name == storyline.Name);
        return this with { Storylines = exists ? [.. Storylines.Select(candidate => candidate.Name == storyline.Name ? kept : candidate)] : [.. Storylines, kept] };
    }

    static ScreenSet WithDefaultStoryline(ScreenSet set)
    {
        var others = set.Storylines.Where(storyline => storyline.Name != set.DefaultStoryline);
        var own = set.Storylines.FirstOrDefault(storyline => storyline.Name == set.DefaultStoryline);
        return set with { Storylines = [new Storyline(set.DefaultStoryline, [.. set.Screens], own?.Title), .. others] };
    }
}
