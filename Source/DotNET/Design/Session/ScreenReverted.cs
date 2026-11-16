// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A screen went back to an earlier revision: a new revision that restores it.
/// </summary>
/// <param name="RevisionId">The new revision's id.</param>
/// <param name="Screen">The screen.</param>
/// <param name="ToRevisionId">The revision it goes back to.</param>
/// <param name="Author">Who reverted it.</param>
/// <param name="TurnId">The turn it belongs to; empty when there is none.</param>
[EventType]
public record ScreenReverted(string RevisionId, string Screen, string ToRevisionId, string Author, string TurnId = "");
