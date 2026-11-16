// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { collectComponents } from '@cratis/scene.engine';
import type { ProfileUsage } from '../../UiProfile/ProfileUsage';
import { studioLayout } from '../Document/studioScreen';
import { parseStoredDocument } from '../Document/upgradeStoredDocument';

// A stored screen and where it came from, so a blocker can say which screen relies on what.
export interface StoredScreen {
    name: string;
    document: SceneDocument;
}

const unique = <T>(items: readonly T[]): T[] => [...new Set(items)];

// What a screen relies on from the UI Profile: the layout it is built on, the templates it uses, the components it
// places - by the names the document stores, so the profile can say whether it still resolves them - and the slots it
// fills. The UI Profile page uses this to refuse a profile the existing screens could no longer be shown with.
// A screen can be filled from a dialog template (a dialog is filled exactly like a screen), so the templates the profile's packages offer as dialogs
// are told apart: the profile looks a dialog template up among the dialogs, not among the screen templates.
export function collectProfileUsage({ name, document }: StoredScreen, dialogTemplateNames: ReadonlySet<string> = new Set()): ProfileUsage {
    const templates = unique([
        ...document.screens.map(screen => screen.screenTemplate).filter((template): template is string => !!template),
        ...document.screenTemplates.map(template => template.fitsSlot ? template.name : undefined).filter((template): template is string => !!template),
    ]);

    const own = templates.filter(template => document.screenTemplates.every(ownTemplate => ownTemplate.name !== template));

    return {
        screen: name,
        layouts: unique(document.screens.map(screen => screen.layout).filter(layout => layout !== studioLayout.name)),
        screenTemplates: own.filter(template => !dialogTemplateNames.has(template)),
        dialogTemplates: own.filter(template => dialogTemplateNames.has(template)),
        components: unique(collectComponents(document).map(component => component.componentName)),
        slots: document.screens
            .filter(screen => screen.layout !== studioLayout.name)
            .flatMap(screen => Object.keys(screen.slotContent).map(slot => ({ owner: screen.layout, slot }))),
    };
}

// The usages of every stored screen. A screen whose document cannot be read is left out rather than failing the page.
export function collectProfileUsages(screens: readonly { name: string; document: string | undefined }[], dialogTemplateNames: ReadonlySet<string> = new Set()): ProfileUsage[] {
    return screens.flatMap(screen => {
        if (!screen.document) return [];
        try {
            return [collectProfileUsage({ name: screen.name, document: parseStoredDocument<SceneDocument>(screen.document) }, dialogTemplateNames)];
        } catch {
            return [];
        }
    });
}
