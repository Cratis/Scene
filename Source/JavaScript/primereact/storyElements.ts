// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Control, ExternalComponent, HorizontalAlignment, Panel, SceneElement, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';

/**
 * Builders for the Scene element trees the stories in this package render.
 *
 * The stories deliberately do not call an adapter directly. They build a real element tree, hand it to
 * the real `SceneElementView` with the real `primeReactComponents` registry, and let the engine walk it -
 * because the thing worth having visual coverage of is the whole path, not the leaf. A story that
 * rendered `<PrimeDropdown element={...} />` would keep passing after the registry key was misspelled.
 *
 * These live in the source tree rather than in a story file because ten galleries share them.
 */

/**
 * The base every visual element carries, filled with the neutral values a story never varies.
 */
function control(id: string): Control {
    return {
        id,
        name: id,
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
        borderThickness: { left: 0, top: 0, right: 0, bottom: 0 },
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        tabIndex: 0,
    };
}

/**
 * An `ExternalComponent` naming one of this package's components.
 *
 * The name is passed bare and qualified here with {@link componentRegistryKey}, so a story reads as the
 * abstract name a screen would write rather than as a registry key.
 *
 * @param id A unique id within the story's tree.
 * @param componentName The bare component name, as declared in the manifest.
 * @param properties The element's authored configuration.
 * @param slots Child elements, by slot name.
 * @returns The element.
 */
export function sceneComponent(
    id: string,
    componentName: string,
    properties: Record<string, unknown> = {},
    slots: Record<string, SceneElement[]> = {}
): ExternalComponent {
    return { ...control(id), properties, componentName: componentRegistryKey('PrimeReact', componentName), slots };
}

/**
 * A panel holding children - the renderer turns it into a plain wrapping `div`.
 *
 * @param id A unique id within the story's tree.
 * @param children The children to lay out.
 * @returns The panel.
 */
export function scenePanel(id: string, children: SceneElement[]): Panel {
    return { ...control(id), children };
}

/**
 * A gallery: every entry wrapped in this package's own `section` component so it is labeled with the
 * abstract name it demonstrates.
 *
 * Using `section` rather than a hand-written heading means the labels themselves go through the registry,
 * so a gallery that renders proves one more adapter than it appears to.
 *
 * @param id A unique id within the story's tree.
 * @param entries The components to show, each with the abstract name it is registered under.
 * @returns The panel to hand to `SceneElementView`.
 */
export function sceneGallery(id: string, entries: ExternalComponent[]): Panel {
    return scenePanel(
        id,
        entries.map((entry) =>
            sceneComponent(`${entry.id}-section`, 'section', { title: entry.componentName.slice('PrimeReact:'.length) }, { content: [entry] })
        )
    );
}
