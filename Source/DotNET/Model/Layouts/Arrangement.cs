// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text.Json.Serialization;

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
/// <remarks>
/// Without <see cref="JsonPolymorphicAttribute"/> here, `System.Text.Json` serializes a reference typed as
/// the abstract base by its static type - an empty object, regardless of whether it holds a real
/// <see cref="FlowArrangement"/> tree. A renderer reading `/stage/scene` then sees `{}` for every layout
/// and screen template arrangement, which is indistinguishable from "none declared" and was silently
/// discarding real arrangement data end to end.
/// </remarks>
[JsonPolymorphic]
[JsonDerivedType(typeof(FlowArrangement))]
[JsonDerivedType(typeof(FreeformArrangement))]
[JsonDerivedType(typeof(FreeformSlotArrangement))]
public abstract record Arrangement;
