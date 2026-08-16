// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The slots the gallery's screen templates offer to whatever they contain.
 *
 * Distinct from {@link SlotName}, which is the *layout's* vocabulary. A screen template declares its own
 * slots, and a template nested inside it names one of these in `fitsSlot` - so the same name means
 * different places at different depths, and that is fine: `fitsSlot` is always resolved against the direct
 * parent, never globally.
 */
export enum TemplateSlotName {
    /** A template's own title area. */
    Header = 'header',

    /** The main region a nested template fits into. */
    Body = 'body',

    /** An optional column beside the body. */
    SidePanel = 'sidePanel',

    /** The action strip above a body. */
    Toolbar = 'toolbar',

    /** Buttons belonging to a header or a form. */
    Actions = 'actions',

    /** The row of figures a dashboard opens with. */
    Stats = 'stats',

    /** The larger left-hand column of a dashboard. */
    Primary = 'primary',

    /** The narrower right-hand column of a dashboard. */
    Secondary = 'secondary',
}
