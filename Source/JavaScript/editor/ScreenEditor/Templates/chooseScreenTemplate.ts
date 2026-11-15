// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument, ScreenTemplate } from '@cratis/scene.model';
import { screenName } from '../Document/studioScreen';

// The document with its screen built from another template, or from none. A package's template is copied into the
// document when it is chosen, so the document stands on its own - Scene resolves a screen's template from the document
// it is given. A copy the screen no longer uses and nobody changed is taken out again; one that was changed stays.
export function chooseScreenTemplate(document: SceneDocument, chosen: ScreenTemplate | undefined, packaged: readonly ScreenTemplate[]): SceneDocument {
    const screen = document.screens.find(candidate => candidate.name === screenName);
    if (!screen || screen.screenTemplate === chosen?.name) return document;

    const previous = screen.screenTemplate;
    const screens = document.screens.map(candidate => {
        if (candidate !== screen) return candidate;
        const { screenTemplate: _, ...rest } = candidate;
        return chosen ? { ...rest, screenTemplate: chosen.name } : rest;
    });

    let screenTemplates = document.screenTemplates.filter(template => !isUnchangedUnusedCopy(template, previous, screens, packaged));
    if (chosen && !screenTemplates.some(template => template.name === chosen.name)) screenTemplates = [...screenTemplates, globalThis.structuredClone(chosen)];

    return { ...document, screens, screenTemplates };
}

function isUnchangedUnusedCopy(template: ScreenTemplate, previous: string | undefined, screens: SceneDocument['screens'], packaged: readonly ScreenTemplate[]): boolean {
    if (template.name !== previous || screens.some(screen => screen.screenTemplate === previous)) return false;
    const original = packaged.find(candidate => candidate.name === previous);
    return original !== undefined && JSON.stringify(original) === JSON.stringify(template);
}
