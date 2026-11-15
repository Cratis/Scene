// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// Tweak controls were offered for a screen, or for the design as a whole.
/// </summary>
/// <param name="Tweaks">The controls.</param>
/// <param name="Screen">The screen; empty for the design as a whole.</param>
[EventType]
public record TweaksProposed(IReadOnlyList<ProposedTweak> Tweaks, string Screen = "");
