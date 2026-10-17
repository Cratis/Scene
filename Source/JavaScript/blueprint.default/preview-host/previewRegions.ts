// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProfileRegion, profileRegionAttribute } from '@cratis/scene.engine';

/** A region's box in the preview's own, unscaled pixels, measured from the preview's top left corner. */
export interface PreviewRegionRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** What a design host asks of the preview about its regions (designer contract rule N9). */
export interface PreviewRegionHandle {
    /**
     * The box of a region as it is drawn now, or `undefined` when it is not drawn. Follows layout changes and stays correct when the host scales
     * the preview, because it is measured against the preview's own size, never against the screen.
     */
    regionRect(region: ProfileRegion): PreviewRegionRect | undefined;
}

const regions = new Set<string>(Object.values(ProfileRegion));

const selector = `[${profileRegionAttribute}]`;

/** The primary actions of the content: what the `accent` region marks. */
const primaryAction = '[data-emphasis="primary"], .p-button:not(.p-button-text):not(.p-button-outlined):not(.p-button-secondary):not(.p-button-link):not(.p-button-icon-only)';

/** The region an event target belongs to, or `undefined` when it is outside every region. */
export function regionOf(target: EventTarget | null): ProfileRegion | undefined {
    const element = target instanceof Element ? target.closest(selector) : null;
    const value = element?.getAttribute(profileRegionAttribute) ?? undefined;
    return value !== undefined && regions.has(value) ? value as ProfileRegion : undefined;
}

function isDrawn(element: Element): boolean {
    const box = element.getBoundingClientRect();
    return box.width > 0 || box.height > 0;
}

/** The element a region is drawn by now: the first drawn one when it is drawn twice (identity in the top bar and in the open menu panel). */
export function drawnRegionElement(root: Element, region: ProfileRegion): Element | undefined {
    return Array.from(root.querySelectorAll(`[${profileRegionAttribute}="${region}"]`)).find(isDrawn);
}

/** The box of a region, measured against the preview root's own size so a scale applied by the host cancels out. */
export function measureRegion(root: HTMLElement, region: ProfileRegion): PreviewRegionRect | undefined {
    const element = drawnRegionElement(root, region);
    if (element === undefined) return undefined;
    const box = element.getBoundingClientRect();
    const frame = root.getBoundingClientRect();
    const scale = root.offsetWidth > 0 && frame.width > 0 ? frame.width / root.offsetWidth : 1;
    return { x: (box.left - frame.left) / scale, y: (box.top - frame.top) / scale, width: box.width / scale, height: box.height / scale };
}

/**
 * Makes the regions reachable from the keyboard - one tab stop per region, on the element that is drawn - and marks the primary action of the
 * content as the `accent` region. Called again whenever the shell changes.
 */
export function markRegions(root: HTMLElement, interactive: boolean): void {
    if (root.querySelector(`[${profileRegionAttribute}="${ProfileRegion.Accent}"]`) === null) {
        root.querySelector(`.layout-content ${primaryAction.split(', ').join(', .layout-content ')}`)?.setAttribute(profileRegionAttribute, ProfileRegion.Accent);
    }

    if (!interactive) return;
    for (const region of regions) {
        const drawn = drawnRegionElement(root, region as ProfileRegion);
        for (const element of Array.from(root.querySelectorAll(`[${profileRegionAttribute}="${region}"]`))) {
            element.setAttribute('tabindex', element === drawn ? '0' : '-1');
        }
    }
}
