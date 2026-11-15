// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A design session began, on a subject, in a mode and - when it is constrained - with the templates it may use.
/// </summary>
/// <param name="SessionId">The session's id.</param>
/// <param name="Subject">What it designs for.</param>
/// <param name="Mode">Whether it designs screens or templates.</param>
/// <param name="StartedBy">Who started it.</param>
/// <param name="TemplateSet">The templates it may use; empty when it is not constrained.</param>
/// <param name="SeededFromSessionId">The session whose screens this one starts from; empty when it is not seeded.</param>
[EventType]
public record DesignSessionStarted(
    string SessionId,
    DesignSubject Subject,
    DesignMode Mode,
    string StartedBy,
    IReadOnlyList<string> TemplateSet,
    string SeededFromSessionId = "");
