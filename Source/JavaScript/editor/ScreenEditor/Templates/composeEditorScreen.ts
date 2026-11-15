// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, SceneNodeKind, type Panel, type SceneDocument, type SceneElement } from '@cratis/scene.model';
import { resolveTemplateChain } from '@cratis/scene.engine';
import { LayoutItem } from '../Layouts/LayoutItem';
import { createPanel } from '../Document/createPanel';
import { contentSlot, editingScope, screenName } from '../Document/studioScreen';
import { formStandIns, nativeStandIns, type FormStandInSource, type NativeEntry } from './nativeStandIns';
import { dialogActionsChrome } from './dialogActionsChrome';
import { needsSlotSections, slotSectionsOf } from './slotSections';

export const compositionId = 'composition';

// The screen as it is drawn: what its templates put around it, in outer-to-inner order, then the screen's own content.
export interface EditorComposition {

    // A neutral column holding the template content and the screen's own root. It is chrome - it is not in the document.
    element: Panel;

    // The top-level elements of the composition, in order.
    roots: SceneElement[];

    // The part of the roots that the screen itself authored - what it puts into the slots of its templates, its native stand-ins and the forms it opens - and
    // nothing of what its templates put around it. A screen with no template has all of its roots here.
    own: SceneElement[];

    // What is drawn after the screen's content and that is not the screen's, nor in the document: a dialog's button row (StudioIssues#1329). The editor, the
    // thumbnails and the preview of a dialog all draw it, so the dialog looks the same in each.
    chrome: SceneElement[];

    // The templates that contribute content, outermost first.
    templates: string[];

    // When a template with slots of its own is being authored: the section a component is added to when no place is named (its first slot).
    entry?: string;
}

// Composes what an author sees. Template content is placed ahead of the screen's own content - the same order Scene
// gives content that a template puts into the slot a screen fills - so inherited chrome is where it will be in Play.
// When authoring a template the composition is that template's content (and the content of the templates around it).
export interface EditorCompositionOptions {

    // Draw the dialog's button row after the screen's content, as the outlet of actions it is, so it can be edited where it is drawn.
    dialogActions?: boolean;
}

export function composeEditorScreen(document: SceneDocument, authoredTemplate?: string, options?: EditorCompositionOptions): EditorComposition {
    const screen = document.screens.find(candidate => candidate.name === screenName);
    const scope = authoredTemplate !== undefined
        ? editingScope(authoredTemplate, true)
        : editingScope(undefined);

    const chain = resolveTemplateChain(document, scope);
    const templates = chain.levels.filter(level => level.kind === SceneNodeKind.ScreenTemplate).map(level => level.owner);

    const roots: SceneElement[] = [];
    let entry: string | undefined;
    for (const name of templates) {
        const template = document.screenTemplates.find(candidate => candidate.name === name);
        if (!template) continue;

        // The template being authored that declares slots of its own is drawn slot by slot, in its arrangement, so it opens as the shape it is.
        if (name === authoredTemplate && needsSlotSections(template)) {
            const sections = slotSectionsOf(template);
            roots.push(...sections.elements);
            entry = sections.entry;
            continue;
        }

        for (const slot of template.slots) roots.push(...(template.content?.[slot.name] ?? []));
    }

    const templateRoots = roots.length;

    // A screen the Screenplay import made fills the slots of the template it names - a blueprint's `header` and `list`, not the editor's one `content` slot - so
    // its content is drawn wherever it sits, the slot the editor authors in first, then the others in the order the document states them (StudioIssues#902).
    if (authoredTemplate === undefined || scope.kind === EditingScopeKind.Screen) {
        const slots = screen?.slotContent ?? {};
        const native = (screen as { native?: { slots?: Record<string, NativeEntry[]> } } | undefined)?.native?.slots ?? {};
        roots.push(...(slots[contentSlot] ?? []), ...nativeStandIns(native[contentSlot], contentSlot));
        for (const [slot, elements] of Object.entries(slots)) {
            if (slot !== contentSlot) roots.push(...elements, ...nativeStandIns(native[slot], slot));
        }

        // A slot that holds nothing typed and only native directives still draws them.
        for (const [slot, entries] of Object.entries(native)) {
            if (slot !== contentSlot && !(slot in slots)) roots.push(...nativeStandIns(entries, slot));
        }

        // The forms of the commands the screen's actions open, which the canvas does not hold as elements.
        roots.push(...formStandIns((screen as { forms?: FormStandInSource[] } | undefined)?.forms, commandsPlacedIn(roots), authoredTemplate === undefined && options?.dialogActions === true));
    }

    const own = roots.slice(templateRoots);
    const chrome = authoredTemplate === undefined && options?.dialogActions ? [dialogActionsChrome()] : [];
    roots.push(...chrome);

    return { element: createPanel(LayoutItem.Stack, compositionId, 'Composition', roots), roots, own, chrome, templates, ...(entry ? { entry } : {}) };
}

// The commands that elements already on the canvas name (a placed command form's `command`), so a form is not drawn twice.
function commandsPlacedIn(roots: readonly SceneElement[]): Set<string> {
    const placed = new Set<string>();
    const visit = (element: SceneElement): void => {
        const { properties, slots, children } = element as unknown as { properties?: Record<string, unknown>; slots?: Record<string, SceneElement[]>; children?: SceneElement[] };
        if (typeof properties?.command === 'string') placed.add(properties.command);
        Object.values(slots ?? {}).forEach(inner => inner.forEach(visit));
        (children ?? []).forEach(visit);
    };
    roots.forEach(visit);
    return placed;
}
