// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, HorizontalAlignment, Panel, SceneElement, VerticalAlignment, Visibility } from '@cratis/scene.model';

/**
 * Constructors for the element trees the gallery templates are built from.
 *
 * `ExternalComponent` inherits fifteen required members from `FrameworkElement` and `VisualElement` -
 * visibility, opacity, z-index, both size constraints, margin and both alignments - before it gets to the
 * two that matter to a template author. Written as object literals, a page of realistic content is
 * ninety percent boilerplate and unreadable. These put the defaults in one place so a template reads as
 * the tree it is.
 */

const elementDefaults = {
    properties: {},
    visibility: Visibility.Visible,
    isEnabled: true,
    opacity: 1,
    size: {},
    zIndex: 0,
    minimumSize: {},
    maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 },
    horizontalAlignment: HorizontalAlignment.Stretch,
    verticalAlignment: VerticalAlignment.Stretch,
};

/**
 * An {@link ExternalComponent} naming a component by its **bare** name.
 *
 * Bare rather than package-qualified on purpose: `resolveComponentName` then decides which active package
 * wins the name against the profile's priority order, so the same template renders with PrimeReact's
 * widgets in one profile and somebody else's in another. A template that qualified its names would pin
 * itself to one library and stop being a template.
 */
export function externalComponent(
    id: string,
    componentName: string,
    properties: Record<string, unknown> = {},
    slots: Record<string, SceneElement[]> = {},
): ExternalComponent {
    return { ...elementDefaults, id, name: id, properties, componentName, slots };
}

/** A {@link Panel} grouping children, for a row or column of content inside a slot. */
export function panel(id: string, children: SceneElement[]): Panel {
    return { ...elementDefaults, id, name: id, children };
}

/** A `core:text` run - the one component name guaranteed to resolve in every profile. */
export function text(id: string, value: string): ExternalComponent {
    return externalComponent(id, 'text', { text: value });
}

/** A `core:button`. */
export function button(id: string, label: string, properties: Record<string, unknown> = {}): ExternalComponent {
    return externalComponent(id, 'button', { label, ...properties });
}

/** A `core:card` wrapping content. */
export function card(id: string, content: SceneElement[], properties: Record<string, unknown> = {}): ExternalComponent {
    return externalComponent(id, 'card', properties, { content });
}
