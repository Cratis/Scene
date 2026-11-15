// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Design.Operations;

namespace Cratis.Scene.Design.Session;

/// <summary>
/// A tweak control that stays with the screen until it is dismissed.
/// </summary>
/// <param name="Id">Its id.</param>
/// <param name="Label">What it is called.</param>
/// <param name="Kind">Either <c language="text">hue</c> or <c language="text">choice</c>.</param>
/// <param name="Address">What it writes.</param>
/// <param name="Dismissed">Whether it was dismissed.</param>
/// <param name="Options">The choices it offers.</param>
/// <param name="Screen">The screen it was offered for.</param>
public record TweakRecord(string Id, string Label, string Kind, TweakAddress Address, bool Dismissed, IReadOnlyList<string>? Options = null, string? Screen = null);
