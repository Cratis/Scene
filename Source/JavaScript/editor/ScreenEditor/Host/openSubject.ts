// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolveScreenTemplates } from '@cratis/scene.engine';
import type { SceneDocument, ScreenTemplate } from '@cratis/scene.model';
import { createPanel } from '../Document/createPanel';
import { createScreenDocument, createTemplateDocument, screenRootId, templateRootId } from '../Document/studioScreen';
import { withScreenAsPrimary } from '../Document/screenSelection';
import { readSceneDocument, type SceneDocumentProblem } from '../Document/readSceneDocument';
import { withLevelOutlets, type LevelRefinements } from '../DesignMode/Outlets/levelOutlets';
import { LayoutItem } from '../Layouts/LayoutItem';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import { qualifyStoredComponentNames } from '../Runtime/storedComponentName';
import type { ScreenEditorSelection, ScreenEditorSubject } from './ScreenEditorHost';

export interface OpenedSubject {
    document: SceneDocument;

    // What to select once it is open.
    select?: ScreenEditorSelection;

    // Whether the screen's slice is opened over a page; see `ScreenEditorSubject.opensOverPage`.
    opensOverPage?: boolean;
}

export type OpenResult =
    | { opened: true; subject: OpenedSubject }
    | { opened: false; problem: SceneDocumentProblem };

// Opens what is saved. A saved Scene document is used as it is once it is known to be one this editor can open; a document
// that is stored but cannot be read is reported rather than replaced, because saving a guess would overwrite it. A subject
// with nothing saved opens as a new, empty screen document. Nothing else is read: the editor never converts another format.
// A document saved before components were stored with their package holds bare names; given the runtime, each is opened under
// the package the UI profile resolves it to, so saving it from here on stores the package and the screen travels typed.
type OpeningRuntime = Pick<ScreenEditorRuntime, 'profile' | 'packages'> & Partial<Pick<ScreenEditorRuntime, 'bundles'>>;

// The levels of the outlets the host keeps (a module's and a feature's) are put in the document it opens, so the chain of outlets resolves through them and edits to them are
// undone with the rest; leaving the editor takes them out again as the host's own.
export function openSubject(subject: ScreenEditorSubject, runtime?: OpeningRuntime, selectableTemplates: readonly ScreenTemplate[] = [], levelOutlets?: readonly LevelRefinements[]): OpenResult {
    const opened = openDocument(subject, runtime, selectableTemplates);
    const result = opened.opened && levelOutlets && levelOutlets.length > 0 ? { opened: true as const, subject: { ...opened.subject, document: withLevelOutlets(opened.subject.document, levelOutlets) } } : opened;
    const selected = result.opened && subject.select ? { opened: true as const, subject: { ...result.subject, select: subject.select } } : result;
    return selected.opened && subject.opensOverPage ? { opened: true, subject: { ...selected.subject, opensOverPage: true } } : selected;
}

function openDocument(subject: ScreenEditorSubject, runtime?: OpeningRuntime, selectableTemplates: readonly ScreenTemplate[] = []): OpenResult {
    const stored = subject.documentText ?? subject.document;
    if (stored !== undefined) {
        const read = readSceneDocument(stored, subject.authoringTemplate);
        if (!read.readable) return { opened: false, problem: read.problem };
        const qualified = runtime ? qualifyStoredComponentNames(read.document, runtime.profile, runtime.packages) : read.document;
        // Another screen of the document is opened as it is: the template chosen for the slice is the first screen's.
        if (subject.screen !== undefined && subject.authoringTemplate === undefined) return { opened: true, subject: { document: withScreenAsPrimary(qualified, subject.screen) } };
        return { opened: true, subject: { document: withSelectedTemplate(qualified, subject, runtime, selectableTemplates) } };
    }

    return { opened: true, subject: { document: blankDocument(subject) } };
}

// Rebase only when the selected template and its ancestry can travel with the screen. Otherwise the stored template
// stays intact and the host's existing save refusal reports the mismatch rather than saving a dangling reference.
function withSelectedTemplate(document: SceneDocument, subject: ScreenEditorSubject, runtime: OpeningRuntime | undefined, selectableTemplates: readonly ScreenTemplate[]): SceneDocument {
    const selected = subject.screenTemplate;
    if (selected === undefined || subject.authoringTemplate !== undefined) return document;
    const screen = document.screens.find(candidate => candidate.name === 'Screen');
    if (!screen || screen.screenTemplate === selected) return document;

    const templates = new Map((runtime?.bundles ?? []).flatMap(bundle => bundle.screenTemplates ?? []).map(template => [template.name, template]));
    // The application's own templates are stored by identifier, which is what the slice selects; they are not in any package.
    for (const template of selectableTemplates) templates.set(template.name, template);
    for (const template of document.screenTemplates) templates.set(template.name, template);
    const layout = document.layouts.find(candidate => candidate.name === screen.layout);
    if (!layout) return document;
    const resolution = resolveScreenTemplates(layout, [...templates.values()]);
    const ancestry = selectedAncestry(selected, templates, layout.name, resolution.placements);
    if (!ancestry) return document;

    const missing = ancestry.filter(template => !document.screenTemplates.some(existing => existing.name === template.name));
    return {
        ...document,
        screens: document.screens.map(candidate => candidate === screen ? { ...candidate, screenTemplate: selected } : candidate),
        screenTemplates: [...document.screenTemplates, ...globalThis.structuredClone(missing)],
    };
}

function selectedAncestry(selected: string, templates: Map<string, ScreenTemplate>, layout: string, placements: ReturnType<typeof resolveScreenTemplates>['placements']): ScreenTemplate[] | undefined {
    const ancestry: ScreenTemplate[] = [];
    let name = selected;
    while (!ancestry.some(template => template.name === name)) {
        const template = templates.get(name);
        if (!template) return undefined;
        ancestry.unshift(template);
        if (template.fitsSlot === undefined) return ancestry;
        const placement = placements.find(candidate => candidate.template === name);
        if (!placement) return undefined;
        if (placement.container === layout) return ancestry;
        name = placement.container;
    }
    return undefined;
}

function blankDocument(subject: ScreenEditorSubject): SceneDocument {
    if (subject.authoringTemplate !== undefined) {
        return createTemplateDocument(subject.authoringTemplate, createPanel(LayoutItem.Stack, templateRootId, 'Template'));
    }

    return createScreenDocument(createPanel(LayoutItem.Stack, screenRootId, 'Screen'), subject.screenTemplate);
}
