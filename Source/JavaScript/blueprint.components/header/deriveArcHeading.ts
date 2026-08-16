// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingKind, ElementBinding, stringProperty } from '@cratis/scene.components';
import { ArcHeading } from './ArcHeading';
import { humanizeBindingName } from './humanizeBindingName';

/**
 * Derives everything a page header shows from one binding and the few properties around it.
 *
 * This function is the entire argument for {@link ArcPageHeader} being a component at all. A screen
 * template can hold a title, a subtitle and a breadcrumb trail perfectly well - they are three literals in
 * a property bag, and a tree is the right place for literals. What a tree cannot do is *derive* them from
 * a single binding name and a registry lookup, and that is what an Arc-bound page needs: the page is about
 * `AllInvoices`, so the heading, the trail and the design-time state should all follow from saying so once.
 *
 * The three binding states are kept apart deliberately, because they are three different problems with
 * three different fixes. No name at all means the template is incomplete. A name nothing is registered
 * under means the host has not wired it - which is the *normal* state at design time, not an error. A
 * resolved name means the page will really talk to a backend.
 *
 * @param properties The element's property bag - `title`, `subtitle` and `section` are read from it.
 * @param binding What the element asked for at its binding site, and what the registry produced.
 * @param kind Whether the binding was a query or a command, so the state can be described in the right words.
 * @returns The derived {@link ArcHeading}.
 */
export function deriveArcHeading(properties: Record<string, unknown>, binding: ElementBinding, kind: BindingKind): ArcHeading {
    const title = stringProperty(properties, 'title') ?? (binding.name === undefined ? 'Untitled page' : humanizeBindingName(binding.name));
    const section = stringProperty(properties, 'section');

    return {
        title,
        subtitle: stringProperty(properties, 'subtitle'),
        trail: section === undefined ? [title] : [section, title],
        bindingName: binding.name,
        isBound: binding.target !== undefined,
        bindingLabel: bindingLabelFor(binding, kind),
    };
}

function bindingLabelFor(binding: ElementBinding, kind: BindingKind): string {
    if (binding.name === undefined) {
        return 'No binding';
    }

    return binding.target === undefined ? `No ${kind} registered as ${binding.name}` : `Bound to ${kind} ${binding.name}`;
}
