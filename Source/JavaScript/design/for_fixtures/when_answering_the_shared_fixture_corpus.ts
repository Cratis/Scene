// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
    DesignCatalogueInput, DesignCatalogueQuery, DesignContext, DesignOperation, DesignSession, DesignSessionEvent, DesignSessionSeed, DesignWorkspace, Storyline, TweakControl,
    addScreenToSet, applyDesignOperations, buildDesignCatalogue, chooseVariation, createDesignContext, createScreenSet, findDanglingLinks, findScreenLinks,
    findUnreachedScreens, foldDesignSession, lowerTweak, moveScreenInSet, queryDesignCatalogue, removeScreenFromSet, resolveTweaks, seedDesignSession, withStoryline,
} from '../index';

interface ScreenSetStep {
    fn: string;
    name: string;
    index?: number;
    storyline: Storyline;
}

interface Fixtures {
    inputs: Record<string, DesignCatalogueInput>;
    workspaces: Record<string, DesignWorkspace>;
    catalogues: { name: string; input: string; expected: unknown }[];
    questions: { name: string; input: string; query: DesignCatalogueQuery; expected: unknown }[];
    operations: { name: string; input: string; workspace: string; operations: DesignOperation[]; expected: { workspaceUnchanged?: boolean } }[];
    variationChoices: { name: string; input: string; workspace: string; screen: string; template: string; expected: unknown }[];
    tweaks: {
        lowered: { name: string; control: TweakControl; value: string; expected: unknown }[];
        resolved: { workspace: string; input: string; controls: TweakControl[]; expected: unknown };
    };
    screenSets: { name: string; initial: string[]; steps: ScreenSetStep[]; expected: unknown }[];
    screenLinks: { name: string; workspace: string; afterOperations?: DesignOperation[]; expected: unknown }[];
    sessions: { name: string; events: DesignSessionEvent[]; expected: unknown }[];
    seeds: { name: string; source: DesignSession; seed: DesignSessionSeed; expectedEvents: unknown; expected: unknown }[];
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../scene-design-fixtures.json'), 'utf-8')) as Fixtures;
const plain = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
/** The session the events fold to, wrapped so that no session at all can be asserted on too. */
const foldedSession = (events: DesignSessionEvent[]) => ({ session: JSON.parse(JSON.stringify(foldDesignSession(events) ?? null)) as unknown });
const contextOf = (input: string): DesignContext => createDesignContext(plain(corpus.inputs[input]));
const workspaceOf = (name: string): DesignWorkspace => plain(corpus.workspaces[name]);

describe('when answering the shared Scene Design fixture corpus', () => {
    it('should have cases in every section', () => {
        for (const section of [corpus.catalogues, corpus.questions, corpus.operations, corpus.screenSets, corpus.screenLinks, corpus.sessions]) section.length.should.be.greaterThan(1);
        corpus.operations.length.should.be.greaterThan(70);
        corpus.seeds.length.should.be.greaterThan(0);
    });

    for (const fixture of corpus.catalogues) {
        it(`should ${fixture.name}`, () => plain(buildDesignCatalogue(plain(corpus.inputs[fixture.input]))).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.questions) {
        it(`should answer a question that ${fixture.name}`, () => plain(queryDesignCatalogue(buildDesignCatalogue(plain(corpus.inputs[fixture.input])), fixture.query)).should.deep.equal(fixture.expected));
    }

    for (const fixture of corpus.operations) {
        it(`should apply operations that ${fixture.name}`, () => {
            const result = plain(applyDesignOperations(workspaceOf(fixture.workspace), plain(fixture.operations), contextOf(fixture.input)));
            const { workspaceUnchanged, ...recorded } = fixture.expected;
            if (workspaceUnchanged === true) {
                result.workspace.should.deep.equal(workspaceOf(fixture.workspace));
                const { workspace: _workspace, ...rest } = result;
                rest.should.deep.equal(recorded);
            } else {
                result.should.deep.equal(recorded);
            }
        });
    }

    for (const fixture of corpus.variationChoices) {
        it(`should ${fixture.name}`, () => {
            const [outcome] = applyDesignOperations(workspaceOf(fixture.workspace), [{ op: 'variations', screen: fixture.screen, templates: [fixture.template] }], contextOf(fixture.input)).outcomes;
            const candidate = outcome.variations![0];
            plain(chooseVariation(workspaceOf(fixture.workspace), contextOf(fixture.input), candidate)).should.deep.equal(fixture.expected);
        });
    }

    for (const fixture of corpus.tweaks.lowered) {
        it(`should ${fixture.name}`, () => plain(lowerTweak(fixture.control, fixture.value)).should.deep.equal(fixture.expected));
    }

    it('should resolve tweak controls against the design', () => {
        const { resolved } = corpus.tweaks;
        plain(resolveTweaks(resolved.controls, workspaceOf(resolved.workspace), contextOf(resolved.input))).should.deep.equal(resolved.expected);
    });

    for (const fixture of corpus.screenSets) {
        it(`should ${fixture.name}`, () => {
            let set = createScreenSet(fixture.initial);
            for (const step of fixture.steps) {
                if (step.fn === 'add') set = addScreenToSet(set, step.name, step.index);
                else if (step.fn === 'remove') set = removeScreenFromSet(set, step.name);
                else if (step.fn === 'move') set = moveScreenInSet(set, step.name, step.index ?? 0);
                else set = withStoryline(set, step.storyline);
            }
            plain(set).should.deep.equal(fixture.expected);
        });
    }

    for (const fixture of corpus.screenLinks) {
        it(`should ${fixture.name}`, () => {
            const base = workspaceOf(fixture.workspace);
            const workspace = fixture.afterOperations ? applyDesignOperations(base, fixture.afterOperations, contextOf('base')).workspace : base;
            plain({
                links: findScreenLinks(workspace.document),
                dangling: findDanglingLinks(workspace.document, workspace.screenSet),
                unreached: findUnreachedScreens(workspace.document, workspace.screenSet),
            }).should.deep.equal(fixture.expected);
        });
    }

    for (const fixture of corpus.sessions) {
        it(`should ${fixture.name}`, () => foldedSession(plain(fixture.events)).should.deep.equal({ session: fixture.expected }));
    }

    for (const fixture of corpus.seeds) {
        it(`should ${fixture.name}`, () => {
            const events = seedDesignSession(plain(fixture.source), plain(fixture.seed));
            plain(events).should.deep.equal(fixture.expectedEvents);
            foldedSession(events).should.deep.equal({ session: fixture.expected });
        });
    }
});
