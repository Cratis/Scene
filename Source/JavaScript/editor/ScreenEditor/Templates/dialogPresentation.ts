// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenFit, type DialogTemplate, type SceneDocument, type Screen } from '@cratis/scene.model';
import { screenName } from '../Document/studioScreen';
import { dialogTemplateNamesOf, displayedFitsOf } from './displayedFits';
import { dialogTitleOf } from './dialogTitle';

// How a screen that is not a page opens: over the page as a dialog, or from its edge as a drawer.
export enum DialogPresentation {
    Dialog = 'dialog',
    Drawer = 'drawer',
}

// The frame a dialog or a drawer is drawn in: who it is and what it is called. The frame is the popup itself - never the application, never a page around it.
export interface DialogFrameDescription {
    presentation: DialogPresentation;

    // The dialog template the screen names, when one of the document's or a blueprint's is named.
    template?: string;

    // What the frame's header says: what the dialog's form does (`dialogTitleOf`), else the dialog template's own display name.
    title?: string;
}

// The dialog templates the screens of a document may name: the document's own, then those the blueprints in play provide.
export function dialogTemplatesIn(document: Pick<SceneDocument, 'dialogTemplates'>, known: readonly DialogTemplate[] = []): DialogTemplate[] {
    return [...(document.dialogTemplates ?? []), ...known];
}

// Whether a screen opens as a dialog or a drawer, and which: what the editor displays as its first fit decides (see `displayedFitsOf`). A first fit of
// Dialog or Drawer opens over the page; Pane, Panel and Page are pages. A screen that lists nothing and names a dialog template (a blueprint's `QuickCreateDialog`
// is stored as that name alone) opens as a dialog whatever its slice is; one that names a screen template is a page; any other displays Dialog when its slice
// opens over a page, otherwise Page.
export function screenPresentationOf(screen: Pick<Screen, 'fits' | 'screenTemplate'>, pageTemplateNames: readonly string[] = [], opensOverPage = false, dialogTemplateNames?: readonly string[]): DialogPresentation | undefined {
    const first = displayedFitsOf(screen, pageTemplateNames, opensOverPage, dialogTemplateNames)[0];
    if (first === ScreenFit.Dialog) return DialogPresentation.Dialog;
    if (first === ScreenFit.Drawer) return DialogPresentation.Drawer;
    return undefined;
}

// The frame the authored screen of the document is drawn in, or nothing when it is a page.
export function dialogFrameOf(document: SceneDocument, known: readonly DialogTemplate[] = [], pageTemplateNames: readonly string[] = [], opensOverPage = false): DialogFrameDescription | undefined {
    const screen = document.screens.find(candidate => candidate.name === screenName);
    if (!screen) return undefined;
    const templates = dialogTemplatesIn(document, known);
    const presentation = screenPresentationOf(screen, [...document.screenTemplates.map(template => template.name), ...pageTemplateNames], opensOverPage, dialogTemplateNamesOf(document, known));
    if (presentation === undefined) return undefined;
    const template = screen.screenTemplate === undefined ? undefined : templates.find(candidate => candidate.name === screen.screenTemplate);
    const title = dialogTitleOf(screen) ?? template?.displayName ?? template?.name;
    return { presentation, ...(template ? { template: template.name } : {}), ...(title ? { title } : {}) };
}
