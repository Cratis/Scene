// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { chatReducer, chatStatusLabel, isChatBusy, type ChatAction, type ChatTurn } from '../chatTurns';

const fold = (...actions: ChatAction[]): ChatTurn[] => actions.reduce<ChatTurn[]>(chatReducer, []);
const asked: ChatAction = { type: 'asked', id: 't1', prompt: 'Add a list', author: 'ada' };
const words = { working: 'Working', refused: 'Refused', failed: 'Failed' };

describe('when a turn of the conversation runs', () => {
    describe('and it has been asked', () => {
        const turns = fold(asked);

        it('should be running', () => turns[0]!.status.should.equal('running'));
        it('should make the chat busy', () => isChatBusy(turns).should.equal(true));
        it('should say it is working', () => chatStatusLabel(turns[0]!, words).should.equal('Working'));
    });

    describe('and the server reports progress', () => {
        const turns = fold(asked,
            { type: 'progressed', id: 't1', progress: { kind: 'status', message: 'Reading the design' } },
            { type: 'progressed', id: 't1', progress: { kind: 'screen', screen: 'List' } },
            { type: 'progressed', id: 't1', progress: { kind: 'screen', screen: 'List' } },
            { type: 'progressed', id: 't1', progress: { kind: 'status', message: 'Placing the table' } });

        it('should show the latest status', () => chatStatusLabel(turns[0]!, words).should.equal('Placing the table'));
        it('should keep every status', () => turns[0]!.progress.should.deep.equal(['Reading the design', 'Placing the table']));
        it('should list a touched screen once', () => turns[0]!.touched.should.deep.equal(['List']));
    });

    describe('and it is answered', () => {
        const turns = fold(asked, { type: 'answered', id: 't1', result: { reply: 'Done', refusals: [], proposals: [], touched: ['List', 'Details'] } });

        it('should be done', () => turns[0]!.status.should.equal('done'));
        it('should say the reply', () => chatStatusLabel(turns[0]!, words).should.equal('Done'));
        it('should no longer make the chat busy', () => isChatBusy(turns).should.equal(false));
        it('should list what it touched', () => turns[0]!.touched.should.deep.equal(['List', 'Details']));
    });

    describe('and part of it is refused', () => {
        const refusal = { code: 'freeStylingNotAllowed', reason: 'No free colors', alternatives: [{ label: 'Use the danger variant' }, { label: 'Propose a token' }] };
        const turns = fold(asked, { type: 'answered', id: 't1', result: { reply: 'Partly', refusals: [refusal], proposals: [], touched: [] } });

        it('should be refused', () => turns[0]!.status.should.equal('refused'));
        it('should say so', () => chatStatusLabel(turns[0]!, words).should.equal('Refused'));
        it('should keep the alternatives to choose from', () => turns[0]!.refusals[0]!.alternatives.map(alternative => alternative.label).should.deep.equal(['Use the danger variant', 'Propose a token']));

        describe('and an alternative is taken', () => {
            const after = chatReducer(turns, { type: 'alternativeTaken', id: 't1', refusal: 0 });

            it('should no longer be offered', () => after[0]!.refusals.should.be.empty);
        });
    });

    describe('and it needs something the design system lacks', () => {
        const turns = fold(asked, { type: 'answered', id: 't1', result: { reply: 'Needs a token', refusals: [], proposals: [{ kind: 'token', summary: 'Add a brand red' }], touched: [] } });

        it('should keep the proposal to send', () => turns[0]!.proposals.length.should.equal(1));
        it('should drop it once sent', () => chatReducer(turns, { type: 'proposalSent', id: 't1', proposal: 0 })[0]!.proposals.should.be.empty);
    });

    describe('and it fails', () => {
        const turns = fold(asked, { type: 'failed', id: 't1', error: 'The service did not answer' });

        it('should have failed', () => turns[0]!.status.should.equal('failed'));
        it('should say why', () => chatStatusLabel(turns[0]!, words).should.equal('The service did not answer'));
        it('should not leave the chat busy', () => isChatBusy(turns).should.equal(false));
    });

    describe('and it is cancelled', () => {
        it('should stop', () => fold(asked, { type: 'cancelled', id: 't1' })[0]!.status.should.equal('cancelled'));
        it('should not undo an answer that already arrived', () => fold(asked, { type: 'answered', id: 't1', result: { reply: 'Done', refusals: [], proposals: [], touched: [] } }, { type: 'cancelled', id: 't1' })[0]!.status.should.equal('done'));
    });

    describe('and several turns are in the conversation', () => {
        const turns = fold(asked, { type: 'asked', id: 't2', prompt: 'Next', author: 'ada' }, { type: 'failed', id: 't1', error: 'x' });

        it('should change only the turn it is about', () => turns.map(turn => turn.status).should.deep.equal(['failed', 'running']));
    });
});
