// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// Arranges a <see cref="Layout"/>'s own named <see cref="Slot"/>s with one placement variant per size
/// class - the Xcode-storyboard model applied to the layout's slots themselves, rather than to the content
/// of one slot (see <see cref="FreeformArrangement"/>). The same slot set is shared across every variant;
/// only placement differs.
/// </summary>
/// <param name="Variants">The placement variants, one per targeted size class.</param>
public record FreeformSlotArrangement(IReadOnlyList<FreeformSlotVariant> Variants) : Arrangement;
