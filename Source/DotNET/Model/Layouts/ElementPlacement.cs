// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.Elements;

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// The absolute position and size of one element within a <see cref="FreeformVariant"/>.
/// </summary>
/// <param name="Element">The element being placed.</param>
/// <param name="X">The horizontal offset.</param>
/// <param name="Y">The vertical offset.</param>
/// <param name="Width">The width.</param>
/// <param name="Height">The height.</param>
public record ElementPlacement(SceneElement Element, double X, double Y, double Width, double Height);
