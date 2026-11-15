// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// A tweak control resolved against the design: the choices it offers and the value it has now.
/// </summary>
/// <param name="Control">The control.</param>
/// <param name="Options">The choices it offers; none for a hue.</param>
/// <param name="Value">The value it has now.</param>
public record ResolvedTweak(TweakControl Control, IReadOnlyList<string> Options, string Value);
