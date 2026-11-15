// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument, SceneElement } from '@cratis/scene.model';
import { composeEditorScreen } from '../Templates/composeEditorScreen';

// What a screen is made of, as a person would list it: which components it holds and the words they show.
export interface ThumbnailContent {
    // The bare component name of every component on the screen, in document order, repeats included.
    components: string[];

    // Every piece of text the components were given to show, in document order.
    texts: string[];
}

// The properties whose string is something the component shows. Anything else a component is given - a color, an id, a binding - is not text a
// person reads on the screen.
const shown = ['label', 'text', 'title', 'content', 'value', 'placeholder', 'header', 'subtitle', 'summary', 'code'];

function collect(element: SceneElement, into: ThumbnailContent): void {
    const candidate = element as unknown as {
        componentName?: unknown;
        properties?: Record<string, unknown>;
        children?: SceneElement[];
        slots?: Record<string, SceneElement[]>;
    };
    if (typeof candidate.componentName === 'string') into.components.push(candidate.componentName);

    for (const key of shown) {
        const value = candidate.properties?.[key];
        if (typeof value === 'string' && value.trim().length > 0) into.texts.push(value);
    }

    // The items of a navigation bar, a menu, a tab view: each is shown by its label.
    for (const value of Object.values(candidate.properties ?? {})) {
        if (!Array.isArray(value)) continue;
        for (const item of value) {
            const label = (item as { label?: unknown } | null)?.label;
            if (typeof label === 'string' && label.trim().length > 0) into.texts.push(label);
        }
    }

    for (const child of candidate.children ?? []) collect(child, into);
    for (const children of Object.values(candidate.slots ?? {})) for (const child of children) collect(child, into);
}

// The content of a screen as it is drawn - the templates around it included, as Play draws them - so a miniature can be held to it: whatever
// the document shows, the miniature must show.
export function thumbnailContent(document: SceneDocument): ThumbnailContent {
    const content: ThumbnailContent = { components: [], texts: [] };
    for (const root of composeEditorScreen(document).roots) collect(root, content);
    return content;
}
