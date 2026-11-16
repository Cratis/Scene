// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A screen was taken out of the design. Its revisions stay in the history.
/// </summary>
/// <param name="Screen">The screen.</param>
[EventType]
public record ScreenRemovedFromDesign(string Screen);
