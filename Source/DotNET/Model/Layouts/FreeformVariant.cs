// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// One placement variant of a <see cref="FreeformArrangement"/>, targeting a specific size class. A size
/// class with no matching variant is a compiler/engine warning, never a silent fallback.
/// </summary>
/// <param name="SizeClass">The size class this variant targets.</param>
/// <param name="Placements">Where each element is placed for this variant.</param>
public record FreeformVariant(SizeClass SizeClass, IReadOnlyList<ElementPlacement> Placements);
