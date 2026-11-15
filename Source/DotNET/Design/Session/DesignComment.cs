// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A comment on a screen, anchored to the element's stable id; a position only when no element is under the pin.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Screen">The screen.</param>
/// <param name="Text">What it says.</param>
/// <param name="Author">Who wrote it.</param>
/// <param name="Resolved">Whether it was resolved.</param>
/// <param name="ElementId">The element it is anchored to.</param>
/// <param name="Position">The position it was pinned at.</param>
public record DesignComment(string Id, string Screen, string Text, string Author, bool Resolved, string? ElementId = null, CommentPosition? Position = null);
