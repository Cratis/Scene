// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using Cratis.Scene.Model.SizeClasses;

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// One placement variant of a <see cref="FreeformSlotArrangement"/>, targeting a specific size class - the
/// counterpart to <see cref="FreeformVariant"/>, which places elements within a single slot instead of
/// placing a layout's own slots. A size class with no matching variant is a compiler/engine warning, never
/// a silent fallback, matching <see cref="FreeformVariant"/>.
/// </summary>
/// <param name="SizeClass">The size class this variant targets.</param>
/// <param name="Placements">Where each of the layout's slots is placed for this variant.</param>
public record FreeformSlotVariant(SizeClass SizeClass, IReadOnlyList<SlotPlacement> Placements);
