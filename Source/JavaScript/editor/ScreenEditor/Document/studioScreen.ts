// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, type EditingScope, type Layout, type Panel, type SceneDocument, type SceneElement } from '@cratis/scene.model';

// The one layout every authored screen and template uses: a single content slot, filled by the root panel.
export const studioLayout: Layout = { name: 'StudioScreen', slots: [{ name: 'content' }] };

export const contentSlot = 'content';
export const screenName = 'Screen';
export const templateRootId = 'template-root';
export const screenRootId = 'screen-root';

const emptyDocument = (): SceneDocument => ({
    layouts: [studioLayout],
    screenTemplates: [],
    dialogTemplates: [],
    screens: [],
    exposures: [],
    instanceContributions: [],
});

// A document holding one authored screen whose content is the given root.
export function createScreenDocument(root: SceneElement, template?: string): SceneDocument {
    return {
        ...emptyDocument(),
        screens: [{ name: screenName, layout: studioLayout.name, slotContent: { [contentSlot]: [root] }, forms: [], contributions: [], ...(template ? { screenTemplate: template } : {}) }],
    };
}

// A document holding one screen template whose content is the given root.
export function createTemplateDocument(name: string, root: SceneElement, fitsSlot?: string): SceneDocument {
    return {
        ...emptyDocument(),
        screenTemplates: [{ name, slots: [{ name: contentSlot }], content: { [contentSlot]: [root] }, ...(fitsSlot ? { fitsSlot } : {}) }],
    };
}

// The root of the authored screen, or of the named template.
export function authoredRoot(document: SceneDocument, template?: string): Panel | undefined {
    const content = template === undefined
        ? document.screens.find(screen => screen.name === screenName)?.slotContent
        : document.screenTemplates.find(candidate => candidate.name === template)?.content;
    return content?.[contentSlot]?.[0] as Panel | undefined;
}

// The scope an author edits in: the screen itself, or - when authoring a template - that template.
export function editingScope(template?: string, authoringTemplate = false): EditingScope {
    return authoringTemplate && template !== undefined
        ? { kind: EditingScopeKind.ScreenTemplate, name: template, layout: studioLayout.name }
        : { kind: EditingScopeKind.Screen, name: screenName };
}
