// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A screen of the session and the revision that is its current one. Only the current revision is written into the host's Screenplay.
/// </summary>
/// <param name="Screen">The screen's name.</param>
/// <param name="CurrentRevision">The id of its current revision.</param>
public record ScreenEntry(string Screen, string CurrentRevision);
