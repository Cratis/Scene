// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A comment was added to a screen.
/// </summary>
/// <param name="CommentId">The comment's id.</param>
/// <param name="Screen">The screen.</param>
/// <param name="Text">What it says.</param>
/// <param name="Author">Who wrote it.</param>
/// <param name="ElementId">The element it is anchored to; empty when no element was under the pin - a <see cref="CommentPinned"/> event then places it.</param>
[EventType]
public record CommentAdded(string CommentId, string Screen, string Text, string Author, string ElementId = "");
