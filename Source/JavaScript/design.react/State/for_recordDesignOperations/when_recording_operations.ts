// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createDesignContext, createScreenSet, foldDesignSession, type DesignSession, type DesignWorkspace } from '@cratis/scene.design';
import { aSession } from '../../given/aSession';
import { started } from '../../given/aStartedDesign';
import { countingDesignIds } from '../../Host/randomDesignIds';
import { createFakeDesignHost } from '../../Testing/createFakeDesignHost';
import { recordDesignOperations, recordDocumentEdit, type RecordedDesignOperations } from '../recordDesignOperations';
import { screenSetOf } from '../storylines';

const fake = createFakeDesignHost();
const ids = countingDesignIds();
let turns = 0;
const context = createDesignContext(fake.host.catalogue.input());
const bridge = fake.host.screenplay;
const template = context.catalogue.templates.find(candidate => candidate.type === 'List')!.name;

async function workspaceOf(session: DesignSession): Promise<DesignWorkspace> {
    const texts = session.screens.map(entry => ({ screen: entry.screen, text: session.revisions.find(revision => revision.id === entry.currentRevision)!.text }));
    return { document: await bridge.toDocument(texts, session.mode), screenSet: screenSetOf(session), profile: fake.runtime.profile };
}

async function record(session: DesignSession, operations: Parameters<typeof recordDesignOperations>[0]['operations'], extra: { focus?: string; prompt?: string } = {}): Promise<RecordedDesignOperations> {
    return recordDesignOperations({ session, workspace: await workspaceOf(session), context, operations, author: 'ada', turnId: `turn-${++turns}`, ids, bridge, ...extra });
}

describe('when recording design operations', () => {
    describe('and two screens are added in one turn', () => {
        let recorded: RecordedDesignOperations;

        beforeAll(async () => {
            recorded = await record(aSession([]), [{ op: 'addScreen', name: 'List', template }, { op: 'addScreen', name: 'Details', template }], { prompt: 'A list and its details' });
        });

        it('should record one revision per screen', () => recorded.events.filter(event => event.type === 'ScreenRevisionRecorded').map(event => (event as { screen: string }).screen).should.deep.equal(['List', 'Details']));
        it('should share the turn id between them', () => recorded.events.filter(event => event.type === 'ScreenRevisionRecorded').map(event => (event as { turnId?: string }).turnId).should.have.lengthOf(2).and.satisfy((turnIds: (string | undefined)[]) => turnIds[0] !== undefined && turnIds[0] === turnIds[1]));
        it('should keep the prompt with each', () => recorded.events.filter(event => event.type === 'ScreenRevisionRecorded').every(event => (event as { prompt?: string }).prompt === 'A list and its details').should.equal(true));
        it('should put the screens in the order they were added', () => foldDesignSession([started(), ...recorded.events])!.screens.map(entry => entry.screen).should.deep.equal(['List', 'Details']));
        it('should refuse nothing', () => recorded.refusals.should.be.empty);
    });

    describe('and a screen is changed', () => {
        const session = () => aSession([]);
        let after: DesignSession;
        let recorded: RecordedDesignOperations;

        beforeAll(async () => {
            const first = await record(session(), [{ op: 'addScreen', name: 'List', template }]);
            const folded = foldDesignSession([started(), ...first.events])!;
            recorded = await record(folded, [{ op: 'move', screen: 'List', element: 'nothing', outlet: 'body' }, { op: 'profile', key: 'corners', value: 'Round' }], { focus: 'List' });
            after = foldDesignSession([started(), ...first.events, ...recorded.events])!;
        });

        it('should refuse an operation the design does not allow', () => recorded.refusals.length.should.equal(1));
        it('should offer a way on when it refuses', () => recorded.refusals[0]!.reason.should.not.be.empty);
        it('should record the profile change against the focused screen', () => after.revisions.filter(revision => revision.screen === 'List').length.should.equal(2));
        it('should say which revision it was made from', () => after.revisions[1]!.basisRevision!.should.equal(after.revisions[0]!.id));
        it('should hand the changed profile back for the host to store', () => recorded.profile!.should.not.be.undefined);
    });

    describe('and nothing changes', () => {
        it('should record nothing', async () => (await record(aSession([]), [])).events.should.be.empty);
    });

    describe('and layouts are asked for', () => {
        let recorded: RecordedDesignOperations;

        beforeAll(async () => {
            const first = await record(aSession([]), [{ op: 'addScreen', name: 'List', template }]);
            recorded = await record(foldDesignSession([started(), ...first.events])!, [{ op: 'variations', screen: 'List' }], { prompt: 'Other layouts' });
        });

        it('should record them as a group of the screen, not as a revision', () => recorded.events.map(event => event.type).should.deep.equal(['VariationsProposed']));
        it('should carry the prompt', () => (recorded.events[0] as { prompt?: string }).prompt!.should.equal('Other layouts'));
        it('should text each candidate', () => (recorded.events[0] as { candidates: { text: string }[] }).candidates.every(candidate => JSON.parse(candidate.text).screen.name === 'List').should.equal(true));
        it('should give each an id', () => new Set((recorded.events[0] as { candidates: { id: string }[] }).candidates.map(candidate => candidate.id)).size.should.be.greaterThan(0));
    });

    describe('and a screen is removed', () => {
        it('should take it out of the design and keep its revisions', async () => {
            const first = await record(aSession([]), [{ op: 'addScreen', name: 'List', template }, { op: 'addScreen', name: 'Details', template }]);
            const folded = foldDesignSession([started(), ...first.events])!;
            const recorded = await record(folded, [{ op: 'removeScreen', name: 'Details' }]);
            const after = foldDesignSession([started(), ...first.events, ...recorded.events])!;

            after.screens.map(entry => entry.screen).should.deep.equal(['List']);
            after.revisions.some(revision => revision.screen === 'Details').should.equal(true);
        });
    });
});

describe('when recording an edit made by hand', () => {
    const before = { layouts: [], screenTemplates: [], dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] };

    it('should record a revision of each screen the editor changed and none for the others', async () => {
        const first = await record(aSession([]), [{ op: 'addScreen', name: 'List', template }, { op: 'addScreen', name: 'Details', template }]);
        const session = foldDesignSession([started(), ...first.events])!;
        const document = await bridge.toDocument(session.screens.map(entry => ({ screen: entry.screen, text: session.revisions.find(revision => revision.id === entry.currentRevision)!.text })), 'screens');
        const edited = structuredClone(document);
        (edited.screens.find(screen => screen.name === 'Details') as unknown as { forms: unknown[] }).forms = [{ id: 'f' }];

        const events = await recordDocumentEdit({ session, before: document, after: edited, author: 'ada', turnId: 'by-hand', ids: countingDesignIds(), bridge });

        events.map(event => (event as { screen: string }).screen).should.deep.equal(['Details']);
        (events[0] as { operations: unknown[] }).operations.should.be.empty;
        (events[0] as { basisRevisionId: string }).basisRevisionId.should.equal(session.screens.find(entry => entry.screen === 'Details')!.currentRevision);
    });

    it('should record nothing when the editor changed nothing', async () => {
        (await recordDocumentEdit({ session: aSession([]), before, after: before, author: 'ada', turnId: 't', ids: countingDesignIds(), bridge })).should.be.empty;
    });
});

describe('when asking for an empty screen set', () => {
    it('should start with no screens', () => createScreenSet().screens.should.be.empty);
});
