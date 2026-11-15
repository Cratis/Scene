// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement, Screen } from '@cratis/scene.model';
import { isCoreComponent } from '../coreComponentNamed';

// A piece of text on a screen that reads like sample data - "Featured: 12" - but is a literal, so it is bound to nothing and will stay as typed.
export interface UnboundText {
    screen: string;
    elementId: string;
    text: string;
}

// The text is a literal that carries a figure. A heading or a label that has none is static text by nature and is left alone; text that is marked static is too.
const looksLikeSampleData = (text: string): boolean => /\d/.test(text);

type Nested = SceneElement & { componentName?: string; slots?: Record<string, readonly SceneElement[]> };

const visit = (elements: readonly SceneElement[] | undefined, screen: string, found: UnboundText[]) => {
    for (const element of elements ?? []) {
        const nested = element as Nested;
        const text = element.properties?.text;
        if (isCoreComponent(nested.componentName, 'text') && typeof text === 'string' && element.properties?.static !== true && looksLikeSampleData(text)) {
            found.push({ screen, elementId: element.id, text });
        }

        for (const children of Object.values(nested.slots ?? {})) visit(children, screen, found);
    }
};

// The text of the screens that is sample data bound to nothing. Studio adds the check, not a rule of its own about binding: a literal is a literal, and Scene
// already says which properties can be bound. The author makes the text a stat or binds it to a field - or marks it as static.
export function unboundTextOf(screens: readonly Pick<Screen, 'name' | 'slotContent'>[]): UnboundText[] {
    const found: UnboundText[] = [];
    for (const screen of screens) {
        for (const elements of Object.values(screen.slotContent ?? {})) visit(elements, screen.name, found);
    }

    return found;
}
