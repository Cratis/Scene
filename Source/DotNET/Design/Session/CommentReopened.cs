// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A resolved comment was opened again.
/// </summary>
/// <param name="CommentId">The comment.</param>
[EventType]
public record CommentReopened(string CommentId);
