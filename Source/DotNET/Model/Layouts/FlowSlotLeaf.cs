// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// A <see cref="FlowNode"/> leaf that positions one of a <see cref="Layout"/>'s own named <see cref="Slot"/>s
/// within its macro <see cref="Layout.Arrangement"/> tree - the counterpart to <see cref="FlowLeaf"/>, which
/// positions an element within a single slot's own content instead of positioning a slot within the layout.
/// </summary>
/// <param name="SlotName">The name of the <see cref="Slot"/> being positioned.</param>
public record FlowSlotLeaf(string SlotName) : FlowNode;
