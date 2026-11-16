// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Session;

/// <summary>
/// Starts sessions from other sessions.
/// </summary>
public static class DesignSessions
{
    /// <summary>
    /// Gets the events that start a session from another session's screens - a story's design becoming the design of the issue filed from it. Each screen is
    /// copied as the first revision of its own and linked to the revision of the source it was copied from, so the history says where it began. The new
    /// session has the source's mode and template set; it is not changed by what happens to the source afterwards.
    /// </summary>
    /// <param name="source">The session to copy from.</param>
    /// <param name="seed">What to start with.</param>
    /// <returns>The events, in order, to append to the new session.</returns>
    public static IReadOnlyList<object> Seed(DesignSession source, DesignSessionSeed seed)
    {
        List<object> events = [new DesignSessionStarted(seed.SessionId, seed.Subject, source.Mode, seed.StartedBy, source.TemplateSet ?? [], source.Id)];
        foreach (var entry in source.Screens)
        {
            if (source.CurrentRevisionOf(entry.Screen) is not { } revision)
            {
                continue;
            }

            events.Add(new ScreenRevisionRecorded(
                seed.RevisionId?.Invoke(entry.Screen) ?? $"{seed.SessionId}/{entry.Screen}/1",
                entry.Screen,
                revision.Text,
                [],
                seed.StartedBy,
                DesignSystemVersion: revision.DesignSystemVersion ?? string.Empty,
                OriginSessionId: source.Id,
                OriginRevisionId: revision.Id));
        }

        return events;
    }
}
