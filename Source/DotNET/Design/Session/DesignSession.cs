// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Session;

/// <summary>
/// Everything a design remembers: the screens and how they came to be, the variations asked for, the tweaks on offer and the comments. The model holds
/// the decisions and the session holds the exploration. Hosts persist it as events and fold them with <see cref="DesignSessionReducer"/>.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Subject">What it designs for.</param>
/// <param name="Mode">Whether it designs screens or templates.</param>
/// <param name="StartedBy">Who started it.</param>
/// <param name="Screens">The screens, in order, and their current revisions.</param>
/// <param name="Revisions">Every revision of every screen.</param>
/// <param name="VariationGroups">The variations asked for.</param>
/// <param name="Tweaks">The tweak controls on offer.</param>
/// <param name="Comments">The comments.</param>
/// <param name="TemplateSet">The templates the session may use; absent when it is not constrained.</param>
/// <param name="SeededFrom">The session this one was seeded from.</param>
public record DesignSession(
    string Id,
    DesignSubject Subject,
    DesignMode Mode,
    string StartedBy,
    IReadOnlyList<ScreenEntry> Screens,
    IReadOnlyList<Revision> Revisions,
    IReadOnlyList<VariationGroup> VariationGroups,
    IReadOnlyList<TweakRecord> Tweaks,
    IReadOnlyList<DesignComment> Comments,
    IReadOnlyList<string>? TemplateSet = null,
    string? SeededFrom = null)
{
    /// <summary>
    /// Gets the current revision of a screen.
    /// </summary>
    /// <param name="screen">The screen.</param>
    /// <returns>The revision, or null when the session has no such screen.</returns>
    public Revision? CurrentRevisionOf(string screen)
    {
        var entry = Screens.FirstOrDefault(candidate => candidate.Screen == screen);
        return entry is null ? null : Revisions.FirstOrDefault(revision => revision.Id == entry.CurrentRevision);
    }

    /// <summary>
    /// Gets every revision of a screen, oldest first.
    /// </summary>
    /// <param name="screen">The screen.</param>
    /// <returns>The revisions.</returns>
    public IReadOnlyList<Revision> RevisionsOf(string screen) => [.. Revisions.Where(revision => revision.Screen == screen)];
}
