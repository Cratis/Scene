// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowArrangement, HeightSizeClass, Layout, WidthSizeClass } from '@cratis/scene.model';
import { LayoutName } from './LayoutName';
import { SlotName } from './SlotName';
import { column, row, slotLeaf } from './flowBuilders';

/**
 * The tree at a regular width and height: a topbar across the top, the sidebar column beside the main
 * column, an optional right panel down the edge, and the configurator floating over all of it.
 */
export const appShellRegularRoot = column([
    slotLeaf(SlotName.Topbar),
    row(
        [
            column([slotLeaf(SlotName.Sidebar), slotLeaf(SlotName.Menu, { grow: 1 })]),
            column([slotLeaf(SlotName.Breadcrumb), slotLeaf(SlotName.Content, { grow: 1 }), slotLeaf(SlotName.Footer)], 0, { grow: 1 }),
            slotLeaf(SlotName.RightPanel),
        ],
        0,
        { grow: 1 },
    ),
    slotLeaf(SlotName.ConfigPanel),
]);

/**
 * The tree at a compact width: the sidebar and the right panel leave the flow entirely.
 *
 * They leave rather than shrink because there is no width at which an 18rem panel and a 20rem panel both
 * fit beside content on a phone. The sidebar is still rendered - off-canvas, over the content, behind the
 * mask - but it no longer *occupies* anything, and that is a fact about the arrangement, not about CSS.
 */
export const appShellCompactWidthRoot = column([
    slotLeaf(SlotName.Topbar),
    column([slotLeaf(SlotName.Breadcrumb), slotLeaf(SlotName.Content, { grow: 1 }), slotLeaf(SlotName.Footer)], 0, { grow: 1 }),
    slotLeaf(SlotName.ConfigPanel),
]);

/**
 * The tree at a compact height: the breadcrumb and the footer go.
 *
 * A landscape phone has room across but almost none down, and two horizontal strips of chrome eat most of
 * what is left. Dropping them is the height axis earning its place in the size-class matrix - width alone
 * cannot express it.
 */
export const appShellCompactHeightRoot = column([
    slotLeaf(SlotName.Topbar),
    row(
        [column([slotLeaf(SlotName.Sidebar), slotLeaf(SlotName.Menu, { grow: 1 })]), slotLeaf(SlotName.Content, { grow: 1 }), slotLeaf(SlotName.RightPanel)],
        0,
        { grow: 1 },
    ),
    slotLeaf(SlotName.ConfigPanel),
]);

/**
 * The tree when both axes are compact - a phone in landscape: nothing but the topbar, the content and the
 * configurator.
 *
 * This override exists to be *more specific* than the two single-axis ones. `evaluateFlowArrangement`
 * scores an override by how many axes it targets, so without this one a landscape phone would pick
 * whichever single-axis override was declared last and keep a footer it has no room for.
 */
export const appShellCompactRoot = column([
    slotLeaf(SlotName.Topbar),
    slotLeaf(SlotName.Content, { grow: 1 }),
    slotLeaf(SlotName.ConfigPanel),
]);

/** The arrangement of the {@link appShellLayout}'s own slots, with one override per size-class combination that changes it. */
export const appShellArrangement: FlowArrangement = {
    root: appShellRegularRoot,
    overrides: [
        { width: WidthSizeClass.Compact, root: appShellCompactWidthRoot },
        { height: HeightSizeClass.Compact, root: appShellCompactHeightRoot },
        { width: WidthSizeClass.Compact, height: HeightSizeClass.Compact, root: appShellCompactRoot },
    ],
};

/**
 * The application shell layout.
 *
 * This is the *application-level* structure - the base navigational look an application picks once and
 * every page then lives inside. The regions are the ones PrimeTek's template line settled on: Sakai
 * establishes topbar, sidebar, menu, content and footer, and the premium templates add the breadcrumb and
 * the right panel. Both sets are here, because a layout package covering only the free template's regions
 * forces a fork on anyone who wants the others.
 *
 * The slots carry no arrangement of their own: how a screen's content is arranged *inside* a slot is that
 * page template's business, and a layout that dictated it would stop being a shell.
 */
export const appShellLayout: Layout = {
    name: LayoutName.AppShell,
    slots: [
        { name: SlotName.Topbar },
        { name: SlotName.Sidebar },
        { name: SlotName.Menu },
        { name: SlotName.Breadcrumb },
        { name: SlotName.Content },
        { name: SlotName.Footer },
        { name: SlotName.RightPanel },
        { name: SlotName.ConfigPanel },
    ],
    arrangement: appShellArrangement,
};
