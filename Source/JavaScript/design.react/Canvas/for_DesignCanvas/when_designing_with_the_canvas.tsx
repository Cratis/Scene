// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { currentRevisionOf, foldDesignSession } from '@cratis/scene.design';
import { aStartedDesign, sessionOf } from '../../given/aStartedDesign';
import { createFakeDesignHost, type FakeDesignHost } from '../../Testing/createFakeDesignHost';
import { DesignCanvas } from '../DesignCanvas';

const ask = (prompt: string) => {
    fireEvent.change(screen.getByLabelText('Describe what to design or change'), { target: { value: prompt } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
};

describe('when designing with the canvas', () => {
    describe('and the subject has no design yet', () => {
        let fresh: FakeDesignHost;

        beforeEach(async () => {
            fresh = createFakeDesignHost({ subject: { kind: 'issue', id: 'issue-9' } });
            render(<DesignCanvas host={fresh.host} mode='screens' />);
            await screen.findByText(/No screens yet/);
        });

        it('should start a session for the subject by itself', () => foldDesignSession(fresh.store.getEvents())!.subject.should.deep.equal({ kind: 'issue', id: 'issue-9' }));
        it('should start it as the person designing', () => foldDesignSession(fresh.store.getEvents())!.startedBy.should.equal('ada'));
        it('should start it once', () => fresh.store.getEvents().filter(event => event.type === 'DesignSessionStarted').length.should.equal(1));
    });

    describe('and the canvas is mounted in a workspace', () => {
        it('should draw no page chrome of its own', async () => {
            const { container } = render(<DesignCanvas host={aStartedDesign().host} />);
            await screen.findByLabelText('Design canvas');
            container.querySelectorAll('h1, h2, h3, [role=banner]').length.should.equal(0);
        });
    });

    describe('and the chat bar is asked for a screen', () => {
        let fake: FakeDesignHost;

        beforeEach(async () => {
            fake = aStartedDesign();
            render(<DesignCanvas host={fake.host} />);
            ask('Add a screen called Invoices');
            await screen.findByRole('article', { name: 'Invoices' });
            await screen.findByText('I added Invoices.');
        });

        it('should record a revision of the screen', () => currentRevisionOf(sessionOf(fake), 'Invoices')!.should.not.be.undefined);
        it('should draw the screen as an artboard', () => screen.getByRole('article', { name: 'Invoices' }).getAttribute('data-artboard')!.should.equal('Invoices'));
        it('should list the touched screen in the chat', () => Boolean(within(document.querySelector('.design-chat__touched') as HTMLElement).getByText('Invoices')).should.equal(true));
        it('should empty the box the designer asked in', () => (screen.getByLabelText('Describe what to design or change') as HTMLTextAreaElement).value.should.equal(''));
    });

    describe('and the AI refuses part of a request', () => {
        let fake: FakeDesignHost;

        beforeEach(async () => {
            fake = aStartedDesign();
            render(<DesignCanvas host={fake.host} />);
            ask('Make it neon pink');
            await screen.findByText('Part of that is not allowed in this design system');
        });

        it('should say why', () => Boolean(screen.getByText(/free colors are not allowed/)).should.equal(true));
        it('should offer the alternatives as buttons', () => Boolean(screen.getByRole('button', { name: 'Use sharp corners instead' })).should.equal(true));

        describe('and an alternative that proposes to the design system is clicked', () => {
            beforeEach(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Propose a red token to the design system' }));
                await waitFor(() => fake.proposals.length.should.equal(1));
            });

            it('should send the proposal to the design system', () => fake.proposals[0]!.kind.should.equal('token'));
            it('should stop offering it', () => (screen.queryByRole('button', { name: 'Propose a red token to the design system' }) === null).should.equal(true));
        });
    });

    describe('and the AI fails', () => {
        let fake: FakeDesignHost;

        beforeEach(async () => {
            fake = aStartedDesign();
            render(<DesignCanvas host={fake.host} />);
            ask('please fail');
            await screen.findByText('The design service did not answer.');
        });

        it('should say the turn failed', () => screen.getByRole('alert').textContent!.should.equal('The design service did not answer.'));
        it('should record no revision', () => sessionOf(fake).revisions.should.be.empty);
        it('should let the designer ask again', () => (screen.getByLabelText('Describe what to design or change') as HTMLTextAreaElement).disabled.should.equal(false));
    });

    describe('and the host has no AI', () => {
        it('should have no chat to ask in', async () => {
            render(<DesignCanvas host={aStartedDesign({ ai: false }).host} />);
            (await screen.findByLabelText('Describe what to design or change') as HTMLTextAreaElement).disabled.should.equal(true);
        });
    });
});
