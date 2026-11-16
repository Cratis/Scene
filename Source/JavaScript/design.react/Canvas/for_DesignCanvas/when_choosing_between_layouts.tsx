// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { currentRevisionOf } from '@cratis/scene.design';
import { aStartedDesign, sessionOf } from '../../given/aStartedDesign';
import { askTheChat } from '../../given/canvasInteractions';
import type { FakeDesignHost } from '../../Testing/createFakeDesignHost';
import { DesignCanvas } from '../DesignCanvas';

describe('when choosing between layouts', () => {
    let fake: FakeDesignHost;

    beforeEach(async () => {
        fake = aStartedDesign();
        render(<DesignCanvas host={fake.host} />);
        await askTheChat('Add a screen called Orders', 'I added Orders.');
        await askTheChat('Show me other layouts', /Here are other layouts of Orders/);
    });

    describe('and layouts have been offered', () => {
        it('should show them side by side with the screen', async () => { await screen.findAllByRole('figure'); document.querySelectorAll('[data-candidate]').length.should.be.within(1, 3); });
        it('should draw each of them, not a placeholder for a component the profile cannot resolve', async () => { await screen.findAllByRole('figure'); document.querySelector('.design-variations')!.textContent!.should.not.contain('Unresolved'); });
        it('should name them by letter', async () => (await screen.findByText('A')).textContent!.should.equal('A'));
        it('should offer each to be used', async () => (await screen.findAllByRole('button', { name: 'Use this layout' })).length.should.be.greaterThan(0));
        it('should not change the screen yet', () => sessionOf(fake).revisions.filter(revision => revision.screen === 'Orders').length.should.equal(1));
    });

    describe('and one is chosen', () => {
        let before: string;

        beforeEach(async () => {
            before = currentRevisionOf(sessionOf(fake), 'Orders')!.id;
            const [first] = await screen.findAllByRole('button', { name: 'Use this layout' });
            fireEvent.click(first!);
            await waitFor(() => (currentRevisionOf(sessionOf(fake), 'Orders')!.id === before).should.equal(false));
        });

        it('should make it the next revision of the screen', () => sessionOf(fake).revisions.filter(revision => revision.screen === 'Orders').length.should.equal(2));
        it('should record which was chosen', () => (sessionOf(fake).variationGroups[0]!.chosen !== undefined).should.equal(true));
        it('should keep the others in the history', () => sessionOf(fake).variationGroups[0]!.candidates.length.should.be.greaterThan(0));
        it('should stop offering the layouts', async () => { await waitFor(() => screen.queryAllByRole('figure').length.should.equal(0)); });
        it('should take the chosen layout from the candidate', () => currentRevisionOf(sessionOf(fake), 'Orders')!.text.should.equal(sessionOf(fake).variationGroups[0]!.candidates.find(candidate => candidate.id === sessionOf(fake).variationGroups[0]!.chosen)!.text));
    });
});
