// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { upgradeSlotShape } from '@cratis/scene.engine';
import { screenName } from './studioScreen';

export enum SceneDocumentProblem {
    NotJson = 'notJson',
    WrongShape = 'wrongShape',
    MissingScreen = 'missingScreen',
    MissingTemplate = 'missingTemplate',
}

export type ReadSceneDocument =
    | { readable: true; document: SceneDocument }
    | { readable: false; problem: SceneDocumentProblem };

const collections = ['layouts', 'screenTemplates', 'dialogTemplates', 'screens', 'exposures', 'instanceContributions'] as const;

// Reads a stored document and checks it is one this editor can open: the six collections a Scene document has, and the
// screen - or, when a template is being authored, the template - the editor was asked to open. A document that fails is
// reported, never replaced, so what was stored is not overwritten by a guess. A document stored before Scene 5 - regions declared as outlets, navigation as
// regions, a toolbar element, an action's presentation - is read in the slot shape through Scene's upgrader (StudioIssues#1328); the stored text is left as it
// is, and the next save writes the new shape.
export function readSceneDocument(stored: unknown, authoringTemplate?: string): ReadSceneDocument {
    let value = stored;
    if (typeof stored === 'string') {
        try {
            value = JSON.parse(stored);
        } catch {
            return { readable: false, problem: SceneDocumentProblem.NotJson };
        }
    }

    const candidate = value as Record<string, unknown> | null;
    if (!candidate || typeof candidate !== 'object' || collections.some(name => !Array.isArray(candidate[name]))) {
        return { readable: false, problem: SceneDocumentProblem.WrongShape };
    }

    const upgrade = upgradeSlotShape(candidate);
    const document = (upgrade.changed ? upgrade.document : candidate) as unknown as SceneDocument;
    if (authoringTemplate !== undefined) {
        return document.screenTemplates.some(template => template.name === authoringTemplate)
            ? { readable: true, document }
            : { readable: false, problem: SceneDocumentProblem.MissingTemplate };
    }

    return document.screens.some(screen => screen.name === screenName)
        ? { readable: true, document }
        : { readable: false, problem: SceneDocumentProblem.MissingScreen };
}
