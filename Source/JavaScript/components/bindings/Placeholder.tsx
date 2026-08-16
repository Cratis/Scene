// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';

export interface PlaceholderProps {
    /**
     * The element that could not be rendered as configured. Its `componentName` names what was being
     * rendered, which is most of what makes the placeholder actionable.
     */
    element: ExternalComponent;

    /**
     * What is wrong, phrased as the problem rather than the remedy - `Unresolved query binding 'AllInvoices'`.
     */
    problem: string;
}

/**
 * The stand-in an adapter renders when it has been given a screen it cannot honor - a binding name
 * nothing is registered under, or a required property the screen never set.
 *
 * Deliberately the same presentation as `UnresolvedComponent` in `@cratis/scene.react`: a dashed red box
 * that states the problem in monospace. They are the same class of failure seen at two different depths -
 * the renderer could not find the component, or the component could not find what it needs - and a
 * designer scanning a preview should recognize both instantly as "something here is not wired up".
 *
 * Rendering this rather than throwing is the whole point. Studio's design-time preview usually has no
 * bindings registered at all, and it still has to show a usable layout: one unbound table must cost one
 * dashed box, not the entire screen.
 */
export function Placeholder({ element, problem }: PlaceholderProps) {
    return (
        <div
            data-scene-id={element.id}
            data-scene-placeholder={element.componentName}
            style={{ border: '1px dashed red', color: 'red', padding: '0.25rem 0.5rem', fontFamily: 'monospace' }}
        >
            {problem} on {element.componentName}
        </div>
    );
}
