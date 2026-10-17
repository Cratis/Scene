// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SceneDocument, Screen, ScreenTemplate, TemplateReference, UiProfile } from '@cratis/scene.model';
import { OutletRemaps, ShellSwitchApplication, ShellSwitchChange, TemplateLibrary, applyShellSwitch, placeableScreenTemplates, planShellSwitch, resolveEffectiveShell } from '../index';

interface ApplyCase {
    name: string;
    description: string;
    profile: UiProfile;
    currentRoot: TemplateReference;
    candidateRoot: TemplateReference;
    remaps: OutletRemaps;
    document: { screens: Screen[]; screenTemplates: ScreenTemplate[] };
    expected: Projection;
}

interface Projection {
    applied: boolean;
    screens: { name: string; screenTemplate?: string; slotContent: Record<string, string[]> }[];
    screenTemplates: { name: string; fitsSlot?: string }[];
    changes: ShellSwitchChange[];
}

const readJson = (file: string) => JSON.parse(readFileSync(join(import.meta.dirname, '../../../../', file), 'utf-8'));
const library = (readJson('shell-switch-fixtures.json') as { libraries: { default: TemplateLibrary } }).libraries.default;
const corpus = readJson('shell-switch-apply-fixtures.json') as { cases: ApplyCase[] };

const documentOf = (fixture: ApplyCase): SceneDocument => ({
    layouts: [],
    screenTemplates: fixture.document.screenTemplates,
    dialogTemplates: [],
    screens: fixture.document.screens,
    exposures: [],
    instanceContributions: [],
});

const applyOf = (fixture: ApplyCase): { document: SceneDocument; result: ShellSwitchApplication } => {
    const context = { library };
    const current = resolveEffectiveShell({ ...fixture.profile, root: { template: fixture.currentRoot } }, context);
    const candidate = resolveEffectiveShell({ ...fixture.profile, root: { template: fixture.candidateRoot } }, context);
    const templates = placeableScreenTemplates(fixture.profile, context);
    const plan = planShellSwitch(current, candidate, fixture.document.screens, templates, fixture.remaps);
    const document = documentOf(fixture);
    return { document, result: applyShellSwitch(document, plan, templates) };
};

const projectionOf = (result: ShellSwitchApplication): Projection => ({
    applied: result.applied,
    screens: result.document.screens.map(screen => ({
        name: screen.name,
        ...(screen.screenTemplate === undefined ? {} : { screenTemplate: screen.screenTemplate }),
        slotContent: Object.fromEntries(Object.entries(screen.slotContent).map(([outlet, content]) => [outlet, content.map(element => element.id)])),
    })),
    screenTemplates: result.document.screenTemplates.map(template => ({ name: template.name, ...(template.fitsSlot === undefined ? {} : { fitsSlot: template.fitsSlot }) })),
    changes: result.changes,
});

describe('when applying a shell switch against the shared fixture corpus', () => {
    it('should have cases in the corpus', () => corpus.cases.length.should.be.greaterThan(10));

    it('should cover content moved, content dropped and templates moved, dropped and requalified', () => {
        const changes = corpus.cases.flatMap(fixture => fixture.expected.changes);
        const kinds = new Set(changes.map(change => `${change.kind}:${change.action}`));
        ['content:primary', 'content:moveToPrimary', 'content:mapTo', 'content:drop', 'placement:moveToPrimary', 'placement:mapTo', 'placement:drop', 'placement:keep'].forEach(kind => kinds.has(kind).should.be.true);
    });

    it('should never leave a placeholder or an id in a message', () => {
        const messages = corpus.cases.flatMap(fixture => applyOf(fixture).result.changes.map(change => change.description));
        messages.filter(message => /[{}]|undefined|null|\[object/.test(message)).should.deep.equal([]);
    });

    for (const fixture of corpus.cases) {
        describe(`and the case is ${fixture.name}`, () => {
            const { document, result } = applyOf(fixture);

            it('should give the document and changes the corpus expects', () => JSON.stringify(projectionOf(result)).should.equal(JSON.stringify(fixture.expected)));
            it('should not change the document it was given', () => JSON.stringify(document).should.equal(JSON.stringify(documentOf(fixture))));
            it('should give the same result twice', () => JSON.stringify(applyOf(fixture).result).should.equal(JSON.stringify(result)));
            it('should hand back the very document when nothing changed', () => (result.changes.length === 0).should.equal(result.document === document));
            it('should keep every element exactly once unless dropped', () => {
                const ids = (screens: Screen[]) => screens.flatMap(screen => Object.values(screen.slotContent).flat().map(element => element.id)).sort();
                const dropped = result.changes.filter(change => change.kind === 'content' && change.target === undefined).reduce((sum, change) => sum + change.count, 0);
                (ids(document.screens).length - ids(result.document.screens).length).should.equal(dropped);
            });
        });
    }
});
