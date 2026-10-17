// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProfileSection } from './ProfileSection';
import { describeMenuBehavior, MenuPresentation, NavigationMode } from './shellOptions';

/** A part of the previewed application the author can point at to edit it (designer contract rule N9). */
export enum ProfileRegion {
    /** The logo and the application name wherever they are drawn. */
    Identity = 'identity',

    /** The top bar. */
    Shell = 'shell',

    /** The sidebar, or the horizontal menu items in Horizontal mode. */
    Menu = 'menu',

    /** The content card. */
    Content = 'content',

    /** The primary action. */
    Accent = 'accent',
}

/** The DOM attribute a host marks a region's element with. */
export const profileRegionAttribute = 'data-scene-region';

export interface ProfileRegionInfo {
    id: ProfileRegion;

    /** The label the designer shows. */
    label: string;

    /** The section of the inspector the region edits. */
    section: ProfileSection;

    /** Whether the region is drawn in this mode and state. */
    drawn: boolean;

    /** The region to use when this one is not drawn. The host never invents one. */
    fallback?: ProfileRegion;
}

/**
 * Says which regions a shell exposes in a menu mode and state: the same five everywhere, with the menu not drawn while it is hidden - an Overlay
 * or Drawer menu that is closed, and any menu on a touch screen until it is opened. A region that is not drawn names the one to use instead.
 *
 * The hamburger is not a region; it only opens and closes the menu.
 *
 * @param mode The menu mode.
 * @param touch Whether the preview is a touch size class.
 * @param menuOpen Whether the hidden menu is open.
 * @returns The five regions, in the order a designer lists them.
 */
export function describeRegions(mode: NavigationMode, touch: boolean, menuOpen: boolean): ProfileRegionInfo[] {
    const behavior = describeMenuBehavior(mode, touch);
    const hidden = behavior.presentation === MenuPresentation.Hidden;
    const menuDrawn = !hidden || menuOpen;
    return [
        { id: ProfileRegion.Identity, label: 'App name and logo', section: ProfileSection.App, drawn: true },
        { id: ProfileRegion.Shell, label: 'Shell', section: ProfileSection.Shell, drawn: true },
        { id: ProfileRegion.Menu, label: 'Menu', section: ProfileSection.Menu, drawn: menuDrawn, ...(menuDrawn ? {} : { fallback: ProfileRegion.Shell }) },
        { id: ProfileRegion.Content, label: 'Sample data', section: ProfileSection.SampleData, drawn: true },
        { id: ProfileRegion.Accent, label: 'Look and accent', section: ProfileSection.Look, drawn: true },
    ];
}
