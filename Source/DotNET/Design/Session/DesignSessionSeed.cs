// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Session;

/// <summary>
/// What a session is seeded with.
/// </summary>
/// <param name="SessionId">The new session's id.</param>
/// <param name="Subject">The subject the new session designs for.</param>
/// <param name="StartedBy">Who starts it.</param>
/// <param name="RevisionId">Makes the id of the revision a copied screen starts with; defaults to <c language="text">session/screen/1</c>.</param>
public record DesignSessionSeed(string SessionId, DesignSubject Subject, string StartedBy, Func<string, string>? RevisionId = null);
