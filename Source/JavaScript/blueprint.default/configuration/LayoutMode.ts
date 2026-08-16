// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * How the application shell arranges its sidebar against its content.
 *
 * The vocabulary - and the `layout-<mode>` wrapper class each value maps to - is deliberately the one
 * PrimeTek's template line has used unchanged across Sakai, Diamond, Atlantis, Freya, Apollo, Ultima,
 * Avalon and Verona. Anyone who has themed a PrimeReact application recognizes it, and a shell that
 * invents its own names forces them to learn a second one for no gain.
 *
 * Every value here is user-selectable. Mobile deliberately is not - see {@link effectiveLayoutMode}.
 */
export enum LayoutMode {
    /** Sidebar permanently docked; content is pushed by a matching margin, never covered. */
    Static = 'static',

    /** Sidebar parked off-canvas; opening floats it over the content behind a mask. */
    Overlay = 'overlay',

    /** Icon-only rail with circular buttons; submenus pop out as a floating panel. */
    Slim = 'slim',

    /** Wider rail with each icon's label stacked directly beneath it. */
    SlimPlus = 'slim-plus',

    /** The icon-only rail again, with square buttons, and the topbar shifted by the rail width. */
    Compact = 'compact',

    /** Sidebar flows into the topbar strip as a horizontal row; submenus drop down. */
    Horizontal = 'horizontal',

    /** Full panel translated off-left leaving a strip of icons; hovering slides it in over the content. */
    Reveal = 'reveal',

    /** Collapsed rail that animates its width to full on hover - it grows where reveal slides. */
    Drawer = 'drawer',
}

/** Every {@link LayoutMode}, in the order a configurator should offer them. */
export const layoutModes: LayoutMode[] = [
    LayoutMode.Static,
    LayoutMode.Overlay,
    LayoutMode.Slim,
    LayoutMode.SlimPlus,
    LayoutMode.Compact,
    LayoutMode.Horizontal,
    LayoutMode.Reveal,
    LayoutMode.Drawer,
];
