// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Reducers;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// The Chronicle reducer of a design session: it folds the session's events into a <see cref="DesignSession"/>. The host owns the commands, the
/// authorization and the event stream - it appends these events to an event source per session - and Chronicle runs this reducer over them.
/// </summary>
/// <remarks>
/// <para>
/// The folding itself is <see cref="Fold(DesignSession?, object)"/>, a pure function, so a client replaying events, a spec and the Chronicle reducer
/// agree. An event that does not apply (a revision restored from one that is not there, a variation chosen twice) leaves the session as it is.
/// The TypeScript twin is <c language="text">reduceDesignSession</c>.
/// </para>
/// </remarks>
public class DesignSessionReducer : IReducerFor<DesignSession>
{
    /// <summary>
    /// Folds one event into a session.
    /// </summary>
    /// <param name="session">The session so far; null before it started.</param>
    /// <param name="event">The event: one of the design session event types.</param>
    /// <returns>The session after the event; null when it has not started.</returns>
    public static DesignSession? Fold(DesignSession? session, object @event)
    {
        if (@event is DesignSessionStarted started)
        {
            return session ?? new DesignSession(started.SessionId, started.Subject, started.Mode, started.StartedBy, [], [], [], [], [], NoneWhenEmpty(started.TemplateSet), Absent(started.SeededFromSessionId));
        }

        if (session is null)
        {
            return null;
        }

        return @event switch
        {
            DesignTemplateSetChanged changed => session with { TemplateSet = NoneWhenEmpty(changed.TemplateSet) },
            ScreenRevisionRecorded recorded => Recorded(session, recorded),
            ScreenRemovedFromDesign removed => session with { Screens = [.. session.Screens.Where(entry => entry.Screen != removed.Screen)] },
            ScreensReordered reordered => Reordered(session, reordered),
            ScreenReverted reverted => Reverted(session, reverted),
            VariationsProposed proposed => Proposed(session, proposed),
            VariationChosen chosen => Chosen(session, chosen),
            TweaksProposed tweaks => Tweaked(session, tweaks),
            TweakDismissed dismissed => session with { Tweaks = [.. session.Tweaks.Select(tweak => tweak.Id == dismissed.TweakId ? tweak with { Dismissed = true } : tweak)] },
            CommentAdded added => Commented(session, added),
            CommentResolved resolved => session with { Comments = [.. session.Comments.Select(comment => comment.Id == resolved.CommentId ? comment with { Resolved = true } : comment)] },
            CommentPinned pinned => session with { Comments = [.. session.Comments.Select(comment => comment.Id == pinned.CommentId ? comment with { Position = new CommentPosition(pinned.X, pinned.Y) } : comment)] },
            CommentReopened reopened => session with { Comments = [.. session.Comments.Select(comment => comment.Id == reopened.CommentId ? comment with { Resolved = false } : comment)] },
            _ => session,
        };
    }

    /// <summary>
    /// Folds events, in order, into the session they describe.
    /// </summary>
    /// <param name="events">The events.</param>
    /// <returns>The session; null when the events do not start one.</returns>
    public static DesignSession? FoldAll(IEnumerable<object> events) => events.Aggregate((DesignSession?)null, Fold);

    /// <summary>Handles <see cref="DesignSessionStarted"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnStarted(DesignSessionStarted @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="DesignTemplateSetChanged"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnTemplateSetChanged(DesignTemplateSetChanged @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="ScreenRevisionRecorded"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnRevisionRecorded(ScreenRevisionRecorded @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="ScreenRemovedFromDesign"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnScreenRemoved(ScreenRemovedFromDesign @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="ScreensReordered"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnReordered(ScreensReordered @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="ScreenReverted"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnReverted(ScreenReverted @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="VariationsProposed"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnVariationsProposed(VariationsProposed @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="VariationChosen"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnVariationChosen(VariationChosen @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="TweaksProposed"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnTweaksProposed(TweaksProposed @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="TweakDismissed"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnTweakDismissed(TweakDismissed @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="CommentAdded"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnCommentAdded(CommentAdded @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="CommentResolved"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnCommentResolved(CommentResolved @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="CommentPinned"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnCommentPinned(CommentPinned @event, DesignSession? current) => Fold(current, @event);

    /// <summary>Handles <see cref="CommentReopened"/>.</summary>
    /// <param name="event">The event.</param>
    /// <param name="current">The session so far.</param>
    /// <returns>The session.</returns>
    public DesignSession? OnCommentReopened(CommentReopened @event, DesignSession? current) => Fold(current, @event);

    static string? Absent(string value) => value.Length == 0 ? null : value;

    static IReadOnlyList<string>? NoneWhenEmpty(IReadOnlyList<string>? values) => values is null || values.Count == 0 ? null : [.. values];

    static string? CurrentIdOf(DesignSession session, string screen) => session.Screens.FirstOrDefault(entry => entry.Screen == screen)?.CurrentRevision;

    static DesignSession WithRevision(DesignSession session, Revision revision)
    {
        if (session.Revisions.Any(existing => existing.Id == revision.Id))
        {
            return session;
        }

        var known = session.Screens.Any(entry => entry.Screen == revision.Screen);
        return session with
        {
            Revisions = [.. session.Revisions, revision],
            Screens = known
                ? [.. session.Screens.Select(entry => entry.Screen == revision.Screen ? entry with { CurrentRevision = revision.Id } : entry)]
                : [.. session.Screens, new ScreenEntry(revision.Screen, revision.Id)],
        };
    }

    static DesignSession Recorded(DesignSession session, ScreenRevisionRecorded recorded) =>
        WithRevision(session, new Revision(
            recorded.RevisionId,
            recorded.Screen,
            recorded.Text,
            recorded.Operations,
            recorded.Author,
            Absent(recorded.Prompt),
            Absent(recorded.TurnId),
            Absent(recorded.DesignSystemVersion),
            Absent(recorded.BasisRevisionId) ?? CurrentIdOf(session, recorded.Screen),
            Absent(recorded.RestoredFromRevisionId),
            recorded.OriginSessionId.Length > 0 && recorded.OriginRevisionId.Length > 0 ? new RevisionOrigin(recorded.OriginSessionId, recorded.OriginRevisionId) : null));

    static DesignSession Reordered(DesignSession session, ScreensReordered reordered)
    {
        var known = reordered.Screens.Distinct().Where(name => session.Screens.Any(entry => entry.Screen == name)).ToList();
        var order = known.Concat(session.Screens.Select(entry => entry.Screen).Where(name => !known.Contains(name)));
        return session with { Screens = [.. order.Select(name => session.Screens.First(entry => entry.Screen == name))] };
    }

    static DesignSession Reverted(DesignSession session, ScreenReverted reverted)
    {
        var target = session.Revisions.FirstOrDefault(revision => revision.Id == reverted.ToRevisionId && revision.Screen == reverted.Screen);
        return target is null
            ? session
            : WithRevision(session, new Revision(
                reverted.RevisionId,
                reverted.Screen,
                target.Text,
                [],
                reverted.Author,
                null,
                Absent(reverted.TurnId),
                target.DesignSystemVersion,
                CurrentIdOf(session, reverted.Screen),
                target.Id));
    }

    static DesignSession Proposed(DesignSession session, VariationsProposed proposed) =>
        session.VariationGroups.Any(group => group.Id == proposed.GroupId)
            ? session
            : session with
            {
                VariationGroups =
                [
                    .. session.VariationGroups,
                    new VariationGroup(proposed.GroupId, proposed.Screen, [.. proposed.Candidates.Select(candidate => new VariationCandidateRecord(candidate.Id, candidate.Text))], Absent(proposed.Prompt)),
                ],
            };

    static DesignSession Chosen(DesignSession session, VariationChosen chosen)
    {
        var group = session.VariationGroups.FirstOrDefault(candidate => candidate.Id == chosen.GroupId);
        var candidate = group?.Candidates.FirstOrDefault(entry => entry.Id == chosen.CandidateId);
        if (group is null || candidate is null || group.Chosen is not null)
        {
            return session;
        }

        var revision = new Revision(chosen.RevisionId, group.Screen, candidate.Text, [], chosen.Author, group.Prompt, Absent(chosen.TurnId), null, CurrentIdOf(session, group.Screen));
        var marked = session with { VariationGroups = [.. session.VariationGroups.Select(entry => entry.Id == group.Id ? entry with { Chosen = candidate.Id } : entry)] };
        return WithRevision(marked, revision);
    }

    static DesignSession Tweaked(DesignSession session, TweaksProposed tweaks) =>
        session with
        {
            Tweaks =
            [
                .. session.Tweaks,
                .. tweaks.Tweaks
                    .Where(tweak => !session.Tweaks.Any(existing => existing.Id == tweak.Id))
                    .Select(tweak => new TweakRecord(tweak.Id, tweak.Label, tweak.Kind, tweak.Address, false, tweak.Options, Absent(tweaks.Screen))),
            ],
        };

    static DesignSession Commented(DesignSession session, CommentAdded added) =>
        session.Comments.Any(comment => comment.Id == added.CommentId)
            ? session
            : session with { Comments = [.. session.Comments, new DesignComment(added.CommentId, added.Screen, added.Text, added.Author, false, Absent(added.ElementId))] };
}
