// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One entry in an overlay menu or a breadcrumb trail.
 *
 * PrimeReact 10 shipped this shape as `primereact/menuitem` and both the user menu and the breadcrumb
 * handed an array of it to a `model` prop. PrimeReact 11 deleted that module along with every
 * `model`-driven menu - the components are compositional now - so the *data* half of the contract no
 * longer has an owner in the library. It belongs to whoever reads the element properties, which is this
 * package: the shell is what turns a template's `{ label, icon, targetScreen }` records into rendered
 * entries, so the type it maps them into lives beside the components that map them rather than being
 * re-declared, slightly differently, in each one.
 *
 * It is deliberately the three fields the shell renders rather than a port of PrimeReact 10's full
 * `MenuItem`. Fields nothing renders are fields nothing keeps honest.
 */
export interface MenuEntry {
    /** What to show for the entry. */
    label: string;

    /** The icon font class to draw before the label, or undefined for a label on its own. */
    icon?: string;

    /** Where activating the entry navigates, or undefined when the entry is the page already shown. */
    url?: string;
}
