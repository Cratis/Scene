// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// Replaces a <see cref="FlowArrangement"/>'s root tree for a targeted width and/or height size class.
/// </summary>
/// <param name="Width">The width size class this override targets, or <see langword="null"/> to target any width.</param>
/// <param name="Height">The height size class this override targets, or <see langword="null"/> to target any height.</param>
/// <param name="Root">The replacement tree.</param>
public record FlowOverride(WidthSizeClass? Width, HeightSizeClass? Height, FlowNode Root);
