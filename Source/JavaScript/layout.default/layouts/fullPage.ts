// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FlowArrangement, Layout, WidthSizeClass } from '@cratis/scene.model';
import { LayoutName } from './LayoutName';
import { SlotName } from './SlotName';
import { column, row, slotLeaf } from './flowBuilders';

/**
 * The tree at a regular width: the branding aside beside the content, with the configurator over both.
 *
 * The split is the shape every premium PrimeTek sign-in page uses - a colored branding half and a form
 * half - and it is the reason `aside` is a slot rather than something a screen paints inside `content`.
 */
export const fullPageRegularRoot = column([row([slotLeaf(SlotName.Aside), slotLeaf(SlotName.Content, { grow: 1 })], 0, { grow: 1 }), slotLeaf(SlotName.ConfigPanel)]);

/**
 * The tree at a compact width: the branding aside leaves the flow.
 *
 * On a phone the aside would take 40% of the width from the only thing that matters on a sign-in screen,
 * which is the form. It drops out rather than stacking above it, because a sign-in form pushed below the
 * fold by decoration is the worst possible first screen.
 */
export const fullPageCompactWidthRoot = column([slotLeaf(SlotName.Content, { grow: 1 }), slotLeaf(SlotName.ConfigPanel)]);

/** The arrangement of the {@link fullPageLayout}'s own slots. */
export const fullPageArrangement: FlowArrangement = {
    root: fullPageRegularRoot,
    overrides: [{ width: WidthSizeClass.Compact, root: fullPageCompactWidthRoot }],
};

/**
 * The chrome-less layout.
 *
 * Sign-in, register, forgotten password, verification, lock, error, access-denied, not-found and landing
 * screens all use this rather than a stripped-down application shell, and that split is structural in
 * every PrimeTek template for a reason worth repeating: none of those screens has navigation state, a
 * sidebar to remember or a breadcrumb to place, so hanging them off the application shell would mean every
 * one of the eight modes needs an answer for a page with no menu.
 *
 * The configurator stays, because the sign-in page is very often the first page anyone sees and it still
 * has to honor the chosen theme.
 */
export const fullPageLayout: Layout = {
    name: LayoutName.FullPage,
    slots: [{ name: SlotName.Aside }, { name: SlotName.Content }, { name: SlotName.ConfigPanel }],
    arrangement: fullPageArrangement,
};
