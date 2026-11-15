// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProfileSection } from '@cratis/scene.engine';

/** The six sections of the inspector, in the order they are scrolled through. The ids are Scene's, so a problem names the section it belongs to. */
export const inspectorSections: readonly ProfileSection[] = [
    ProfileSection.App, ProfileSection.Shell, ProfileSection.Look, ProfileSection.Menu, ProfileSection.Packages, ProfileSection.SampleData,
];

/**
 * The section the inspector shows at its top edge. A section is current from its own top until the next one starts, with a small allowance so
 * the tab changes a moment before the heading reaches the edge - the way the tabs follow the scroll in the prototype.
 *
 * @param tops The distance of each section's top from the top of the scrolled content, in section order.
 * @param scrollTop How far the inspector is scrolled.
 * @param allowance How many pixels early a section becomes current.
 * @returns The index of the current section.
 */
export function sectionAtScroll(tops: readonly number[], scrollTop: number, allowance = 40): number {
    let current = 0;
    tops.forEach((top, index) => { if (top - allowance <= scrollTop) current = index; });
    return current;
}

/** The section whose region was pointed at: Scene says which section each region edits (`describeRegions`). */
export function sectionOfRegion(region: string, regions: readonly { id: string; section: ProfileSection }[]): ProfileSection | undefined {
    return regions.find(candidate => candidate.id === region)?.section;
}
