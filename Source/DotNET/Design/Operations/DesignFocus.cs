// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Design.Operations;

/// <summary>
/// What an applied operation drew attention to.
/// </summary>
/// <param name="Screen">The screen.</param>
/// <param name="Template">The template.</param>
/// <param name="Element">The element.</param>
public record DesignFocus(string? Screen = null, string? Template = null, string? Element = null);
