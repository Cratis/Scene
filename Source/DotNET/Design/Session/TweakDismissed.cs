// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Chronicle.Events;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A tweak control was dismissed.
/// </summary>
/// <param name="TweakId">The control.</param>
[EventType]
public record TweakDismissed(string TweakId);
