// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How content is arranged: {@link FlowArrangement} (reflowing, computed per size class) or
 * {@link FreeformArrangement}/{@link FreeformSlotArrangement} (one placement variant per size class). Used
 * at two levels - a {@link Layout}'s own `arrangement` positions its named {@link Slot}s relative to each
 * other (leaves reference a slot by name: {@link FlowSlotLeaf}/{@link SlotPlacement}), while a
 * {@link Slot}'s own `arrangement` positions that slot's own filled content elements (leaves carry the
 * element itself: {@link FlowLeaf}/{@link ElementPlacement}).
 */
export interface Arrangement {}
