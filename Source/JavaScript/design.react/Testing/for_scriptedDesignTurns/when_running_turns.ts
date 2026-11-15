// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { currentRevisionOf } from '@cratis/scene.design';
import type { DesignTurnProgress, DesignTurnRequest } from '../../Host/DesignCanvasHost';
import { aStartedDesign, sessionOf } from '../../given/aStartedDesign';

const request = (prompt: string, extra: Partial<DesignTurnRequest> = {}): DesignTurnRequest =>
    ({ turnId: 'turn-ai', sessionId: 'session-1', subject: { kind: 'story', id: 'story-1' }, mode: 'screens', prompt, author: 'ada', ...extra });

describe('when running scripted design turns', () => {
    describe('and asked to add a screen', () => {
        const fake = aStartedDesign();
        const progress: DesignTurnProgress[] = [];
        let result: Awaited<ReturnType<NonNullable<typeof fake.host.ai>['runTurn']>>;

        beforeAll(async () => {
            result = await fake.host.ai!.runTurn(request('Add a screen called Invoices'), item => progress.push(item), new AbortController().signal);
        });

        it('should record a revision of the new screen', () => currentRevisionOf(sessionOf(fake), 'Invoices')!.should.not.be.undefined);
        it('should record it as the turn', () => currentRevisionOf(sessionOf(fake), 'Invoices')!.turnId!.should.equal('turn-ai'));
        it('should record it under the AI as the author', () => currentRevisionOf(sessionOf(fake), 'Invoices')!.author.should.equal('design-ai'));
        it('should keep the prompt with the revision', () => currentRevisionOf(sessionOf(fake), 'Invoices')!.prompt!.should.equal('Add a screen called Invoices'));
        it('should say which screens it touched', () => result.touched.should.deep.equal(['Invoices']));
        it('should have said what it was doing while it worked', () => progress.some(item => item.kind === 'status').should.be.true);
        it('should refuse nothing', () => result.refusals.should.be.empty);
    });

    describe('and asked for other layouts', () => {
        const fake = aStartedDesign();

        beforeAll(async () => {
            await fake.host.ai!.runTurn(request('Add a screen called Orders'), () => undefined, new AbortController().signal);
            await fake.host.ai!.runTurn(request('Show me other layouts', { focus: { screen: 'Orders' } }), () => undefined, new AbortController().signal);
        });

        it('should offer layouts of the screen', () => sessionOf(fake).variationGroups[0]!.screen.should.equal('Orders'));
        it('should offer no more than three', () => sessionOf(fake).variationGroups[0]!.candidates.length.should.be.within(1, 3));
        it('should leave the screen as it was', () => sessionOf(fake).revisions.filter(revision => revision.screen === 'Orders').length.should.equal(1));
    });

    describe('and asked for something outside the design system', () => {
        const fake = aStartedDesign();
        let result: Awaited<ReturnType<NonNullable<typeof fake.host.ai>['runTurn']>>;

        beforeAll(async () => {
            result = await fake.host.ai!.runTurn(request('Make the page neon pink'), () => undefined, new AbortController().signal);
        });

        it('should refuse', () => result.refusals.length.should.equal(1));
        it('should say why', () => result.refusals[0]!.reason.should.not.be.empty);
        it('should offer alternatives', () => result.refusals[0]!.alternatives.length.should.be.greaterThan(0));
        it('should offer the design system a proposal as one of them', () => result.refusals[0]!.alternatives.some(alternative => alternative.proposal !== undefined).should.be.true);
        it('should record no revision', () => sessionOf(fake).revisions.should.be.empty);
    });

    describe('and asked for tweaks', () => {
        const fake = aStartedDesign();

        beforeAll(async () => {
            await fake.host.ai!.runTurn(request('Add a screen called Home'), () => undefined, new AbortController().signal);
            await fake.host.ai!.runTurn(request('Give me some tweaks', { focus: { screen: 'Home' } }), () => undefined, new AbortController().signal);
        });

        it('should offer tweak controls that stay with the session', () => sessionOf(fake).tweaks.length.should.be.greaterThan(0));
        it('should offer none that are dismissed', () => sessionOf(fake).tweaks.every(tweak => !tweak.dismissed).should.be.true);
    });

    describe('and the turn is cancelled', () => {
        const fake = aStartedDesign({ stepMs: 50 });
        let outcome: unknown;

        beforeAll(async () => {
            const controller = new AbortController();
            const running = fake.host.ai!.runTurn(request('Add a screen called Late'), () => undefined, controller.signal).catch((error: unknown) => error);
            controller.abort();
            outcome = await running;
        });

        it('should stop', () => (outcome instanceof Error || outcome instanceof DOMException).should.be.true);
        it('should record nothing', () => sessionOf(fake).revisions.should.be.empty);
    });
});
