// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// Where a tweak control writes: a profile key, a property of an element, or a design-system token.
/// </summary>
/// <param name="Kind">One of <c language="text">profile</c>, <c language="text">property</c> and <c language="text">token</c>.</param>
/// <param name="Key">The profile key.</param>
/// <param name="Screen">The screen of the element.</param>
/// <param name="Template">The template of the element.</param>
/// <param name="Element">The element.</param>
/// <param name="Prop">The property.</param>
/// <param name="Token">The token address.</param>
public record TweakAddress(string Kind, string? Key = null, string? Screen = null, string? Template = null, string? Element = null, string? Prop = null, string? Token = null);
