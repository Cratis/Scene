// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Session;

/// <summary>
/// The revision a screen was copied from when a session was seeded from another.
/// </summary>
/// <param name="SessionId">The session it was copied from.</param>
/// <param name="RevisionId">The revision it was copied from.</param>
public record RevisionOrigin(string SessionId, string RevisionId);
