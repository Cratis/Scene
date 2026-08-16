// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Everything {@link ArcPageHeader} renders, derived from one binding name and a handful of properties.
 *
 * It is a separate type from the component so the derivation can be specified without rendering anything.
 * That matters more here than it usually does: the whole argument for this being a component rather than
 * a content tree is that it *derives* rather than holds, so the derivation is the part that has to be
 * provably right.
 */
export interface ArcHeading {
    /** The heading text - the screen's `title`, or the binding name read as a sentence when it set none. */
    title: string;

    /** The line under the heading, when the screen supplied one. */
    subtitle?: string;

    /**
     * The breadcrumb trail, outermost first, ending in {@link title}.
     *
     * Derived rather than authored, which is the point: a screen states its section once and the trail
     * follows the heading automatically, so the two can never drift apart the way two literals do.
     */
    trail: string[];

    /** The binding name the header was given, or `undefined` when the screen named none. */
    bindingName?: string;

    /** Whether a host has actually registered {@link bindingName}. */
    isBound: boolean;

    /**
     * The design-time state, in words - what a designer reads off the header when a page is not yet
     * wired. The three cases are genuinely different problems: nothing named, named but unregistered, and
     * working.
     */
    bindingLabel: string;
}
