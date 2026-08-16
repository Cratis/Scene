// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { isContentControl, isExternalComponent, isItemsControl, isPanel } from '@cratis/scene.engine';

/**
 * Every component name an element tree references.
 *
 * A blueprint's templates name components the blueprint itself does not provide - the widgets come from
 * the component libraries it depends on - and a name no active package declares renders as a dashed red
 * placeholder somewhere inside a screen, with nothing pointing back at the template that wrote it.
 * Collecting the names up front is what lets that be a failed check at build or design time instead.
 *
 * The walk uses the engine's own kind guards rather than its own, so it visits exactly the branches the
 * renderer visits and cannot drift from it.
 *
 * @param element The root to walk.
 * @returns Every `componentName` found, in encounter order, with duplicates.
 */
export function componentNamesIn(element: SceneElement): string[] {
    const names: string[] = [];

    if (isExternalComponent(element)) {
        names.push(element.componentName);
        for (const children of Object.values(element.slots)) {
            for (const child of children) {
                names.push(...componentNamesIn(child));
            }
        }
    }

    if (isContentControl(element)) {
        names.push(...componentNamesIn(element.content));
    }

    if (isItemsControl(element)) {
        names.push(...componentNamesIn(element.itemTemplate));
    }

    if (isPanel(element)) {
        for (const child of element.children) {
            names.push(...componentNamesIn(child));
        }
    }

    return names;
}

/**
 * Every distinct component name a set of element trees references, sorted so a report of them is stable.
 */
export function distinctComponentNames(elements: SceneElement[]): string[] {
    return [...new Set(elements.flatMap(componentNamesIn))].sort();
}
