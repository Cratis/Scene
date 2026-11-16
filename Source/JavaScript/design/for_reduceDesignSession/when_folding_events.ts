// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignSession, DesignSessionEvent, currentRevisionOf, foldDesignSession, seedDesignSession } from '../index';

const started: DesignSessionEvent = { type: 'DesignSessionStarted', sessionId: 's1', subject: { kind: 'story', id: 'story-1' }, mode: 'screens', startedBy: 'ada' };
const revision = (revisionId: string, screen: string, text: string, turnId?: string): DesignSessionEvent =>
    ({ type: 'ScreenRevisionRecorded', revisionId, screen, text, operations: [], author: 'ada', ...(turnId === undefined ? {} : { turnId }) });

describe('when folding session events', () => {
    describe('and a screen is revised and then reverted', () => {
        const session = foldDesignSession([started, revision('r1', 'Home', 'first'), revision('r2', 'Home', 'second'), { type: 'ScreenReverted', revisionId: 'r3', screen: 'Home', toRevisionId: 'r1', author: 'grace' }])!;

        it('should keep every revision', () => session.revisions.map(candidate => candidate.id).should.deep.equal(['r1', 'r2', 'r3']));
        it('should make the revert a new revision with the earlier text', () => currentRevisionOf(session, 'Home')!.text.should.equal('first'));
        it('should say which revision it restores', () => currentRevisionOf(session, 'Home')!.restoredFrom!.should.equal('r1'));
        it('should say which revision it was made from', () => currentRevisionOf(session, 'Home')!.basisRevision!.should.equal('r2'));
    });

    describe('and one turn touches two screens', () => {
        const session = foldDesignSession([started, revision('r1', 'Home', 'a', 't1'), revision('r2', 'Settings', 'b', 't1')])!;

        it('should record one revision per screen with the same turn id', () => session.revisions.map(candidate => candidate.turnId).should.deep.equal(['t1', 't1']));
        it('should have both screens', () => session.screens.map(entry => entry.screen).should.deep.equal(['Home', 'Settings']));
    });

    describe('and a variation is chosen', () => {
        const session = foldDesignSession([
            started, revision('r1', 'Home', 'a'),
            { type: 'VariationsProposed', groupId: 'g1', screen: 'Home', prompt: 'other layouts', candidates: [{ id: 'c1', text: 'one' }, { id: 'c2', text: 'two' }] },
            { type: 'VariationChosen', groupId: 'g1', candidateId: 'c2', revisionId: 'r2', author: 'ada' },
        ])!;

        it('should make it the next revision of the screen', () => currentRevisionOf(session, 'Home')!.text.should.equal('two'));
        it('should keep the other candidates in the history', () => session.variationGroups[0].candidates.map(candidate => candidate.id).should.deep.equal(['c1', 'c2']));
        it('should record which was chosen', () => session.variationGroups[0].chosen!.should.equal('c2'));
    });

    describe('and a comment is added', () => {
        const session = foldDesignSession([started, { type: 'CommentAdded', commentId: 'm1', screen: 'Home', elementId: 'list', text: 'Too wide', author: 'ada' }, { type: 'CommentResolved', commentId: 'm1' }])!;

        it('should anchor it to the element', () => session.comments[0].elementId!.should.equal('list'));
        it('should resolve it', () => session.comments[0].resolved.should.be.true);
    });

    describe('and the session is keyed to a subject that is not a story', () => {
        const session = foldDesignSession([{ ...started, subject: { kind: 'designSystem', id: 'ds' }, mode: 'templates', templateSet: ['Page'] } as DesignSessionEvent])!;

        it('should keep the subject', () => session.subject.should.deep.equal({ kind: 'designSystem', id: 'ds' }));
        it('should be in template mode', () => session.mode.should.equal('templates'));
        it('should carry the template set', () => session.templateSet!.should.deep.equal(['Page']));
    });

    describe('and a session is seeded from another', () => {
        const source = foldDesignSession([started, revision('r1', 'Home', 'a'), revision('r2', 'Home', 'b'), revision('r3', 'Gone', 'c'), { type: 'ScreenRemovedFromDesign', screen: 'Gone' }]) as DesignSession;
        const seeded = foldDesignSession(seedDesignSession(source, { sessionId: 'issue-1', subject: { kind: 'issue', id: 'i1' }, startedBy: 'grace' }))!;

        it('should copy the current revision of each screen of the source', () => seeded.revisions.map(candidate => candidate.text).should.deep.equal(['b']));
        it('should link each copy to the revision it came from', () => seeded.revisions[0].origin!.should.deep.equal({ sessionId: 's1', revisionId: 'r2' }));
        it('should remember the session it was seeded from', () => seeded.seededFrom!.should.equal('s1'));
        it('should be keyed to its own subject', () => seeded.subject.kind.should.equal('issue'));
        it('should leave the source as it was', () => source.revisions.should.have.length(3));
    });
});
