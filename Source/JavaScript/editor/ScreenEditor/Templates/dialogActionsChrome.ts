// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { dialogActionsOutletName, type DialogTemplate, type Layout, type Outlet, type SceneDocument, type SceneElement, type ScreenTemplate } from '@cratis/scene.model';
import { dialogTemplateOutlets, outletItemsComponentName } from '@cratis/scene.engine';
import { createExternalComponent } from '../Document/createExternalComponent';
import { contentSlot, screenName } from '../Document/studioScreen';
import { dialogTemplateNamesOf, pageTemplateNamesOf } from './displayedFits';
import { screenPresentationOf } from './dialogPresentation';

export const dialogActionsChromeId = 'dialog-actions-chrome';

// The template a dialog or drawer opens with when nothing says which: Scene's default form dialog.
export const defaultDialogTemplateName = 'FormDialog';

// Whether the screen opens as a dialog or a drawer - which both close with the button row - as what the editor displays it fits says (`displayedFitsOf`).
export function screenFitsDialog(document: SceneDocument, pageTemplateNames: readonly string[] = [], opensOverPage = false, known?: readonly DialogTemplate[]): boolean {
    const screen = document.screens.find(candidate => candidate.name === screenName);
    return screen !== undefined && screenPresentationOf(screen, [...document.screenTemplates.map(template => template.name), ...pageTemplateNames], opensOverPage, dialogTemplateNamesOf(document, known)) !== undefined;
}

// The dialog template whose button row the screen draws: the one the screen names - the document's own, else a blueprint's among `known` - else the
// document's form dialog, else its first dialog template, else the standard one every dialog and drawer has - its `actions` outlet with Cancel and
// Submit - which the document does not need to carry.
export function dialogTemplateOf(document: SceneDocument, known: readonly DialogTemplate[] = []): DialogTemplate {
    const templates = document.dialogTemplates ?? [];
    const named = document.screens.find(candidate => candidate.name === screenName)?.screenTemplate;
    const chosen = named === undefined ? undefined : [...templates, ...known].find(candidate => candidate.name === named);
    return chosen ?? templates.find(candidate => candidate.name === defaultDialogTemplateName) ?? templates[0] ?? { name: defaultDialogTemplateName, slots: [] };
}

// The outlet of actions the dialog's button row draws, when the screen is one and nothing between it and the dialog already declares an outlet of that name.
export function dialogActionsOutletOf(template: DialogTemplate): Outlet | undefined {
    return dialogTemplateOutlets(template).find(outlet => outlet.name === dialogActionsOutletName);
}

// Whether the screen draws the dialog's button row: it is a dialog or a drawer, and the layout and the screen template it sits in declare no outlet called
// `actions` of their own - then that outlet is theirs, and the row would be a second one under the same name.
export function showsDialogActions(document: SceneDocument, templates: readonly ScreenTemplate[] = [], layouts: readonly Layout[] = [], opensOverPage = false, known?: readonly DialogTemplate[]): boolean {
    if (!screenFitsDialog(document, pageTemplateNamesOf(document, [{ screenTemplates: [...templates] }]), opensOverPage, known)) return false;
    const screen = document.screens.find(candidate => candidate.name === screenName);
    const template = screen?.screenTemplate ? [...document.screenTemplates, ...templates].find(candidate => candidate.name === screen.screenTemplate) : undefined;
    const layout = screen?.layout ? [...document.layouts, ...layouts].find(candidate => candidate.name === screen.layout) : undefined;
    return ![...(template?.outlets ?? []), ...(layout?.outlets ?? [])].some(outlet => outlet.name === dialogActionsOutletName);
}

// The document with the chrome placed in the screen's root, for what is asked of a document by element id - Scene's inspection - so the chrome can be
// inspected like the elements it is drawn beside. Nothing is kept: the document the editor holds never has it.
export function documentWithChrome(document: SceneDocument, chrome: readonly SceneElement[]): SceneDocument {
    if (chrome.length === 0) return document;
    const screens = document.screens.map(screen => {
        if (screen.name !== screenName) return screen;
        const root = screen.slotContent?.[contentSlot]?.[0] as (SceneElement & { children?: SceneElement[] }) | undefined;
        if (!root) return screen;
        return { ...screen, slotContent: { ...screen.slotContent, [contentSlot]: [{ ...root, children: [...(root.children ?? []), ...chrome] }, ...screen.slotContent[contentSlot].slice(1)] } };
    });
    return { ...document, screens };
}

// The dialog's button row, drawn after the screen's content as the outlet it is. It is chrome - not in the document - so the surface and the outlet design
// mode treat it as any outlet of actions the screen's template declares. The thumbnail and the preview of a dialog draw it too (`composePlayScreen`).
export function dialogActionsChrome(): SceneElement {
    return createExternalComponent(dialogActionsChromeId, 'Dialog actions', outletItemsComponentName, { name: dialogActionsOutletName, kind: 'actions', items: [] });
}
