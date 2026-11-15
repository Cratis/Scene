// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A comment that is anchored to no element was pinned to a position of its screen.
/// </summary>
/// <param name="CommentId">The comment.</param>
/// <param name="X">Across.</param>
/// <param name="Y">Down.</param>
[EventType]
public record CommentPinned(string CommentId, double X, double Y);
