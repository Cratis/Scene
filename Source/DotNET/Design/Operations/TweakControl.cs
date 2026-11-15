// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// A control worth playing with: a slider over a hue or over the choices of a property.
/// </summary>
/// <param name="Label">What it is called.</param>
/// <param name="Kind">Either <c language="text">hue</c> or <c language="text">choice</c>.</param>
/// <param name="Address">What it writes.</param>
/// <param name="Options">The choices to offer, when fewer than all are wanted.</param>
public record TweakControl(string Label, string Kind, TweakAddress Address, IReadOnlyList<string>? Options = null);
