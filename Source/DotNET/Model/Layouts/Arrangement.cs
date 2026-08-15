// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// How content is arranged: <see cref="FlowArrangement"/> (reflowing, computed per size class) or
/// <see cref="FreeformArrangement"/>/<see cref="FreeformSlotArrangement"/> (one placement variant per size
/// class). Used at two levels - a <see cref="Layout"/>'s own <see cref="Layout.Arrangement"/> positions its
/// named <see cref="Slot"/>s relative to each other (leaves reference a slot by name: <see cref="FlowSlotLeaf"/>/
/// <see cref="SlotPlacement"/>), while a <see cref="Slot"/>'s own <see cref="Slot.Arrangement"/> positions
/// that slot's own filled content elements (leaves carry the element itself: <see cref="FlowLeaf"/>/
/// <see cref="ElementPlacement"/>).
/// </summary>
public abstract record Arrangement;
