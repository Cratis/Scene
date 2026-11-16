// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { currentRevisionOf, revisionsOf } from '@cratis/scene.design';
import { aStartedDesign, sessionOf } from '../../given/aStartedDesign';
import { askTheChat, openTab } from '../../given/canvasInteractions';
import { askTheFakeAI } from '../../Testing/askTheFakeAI';
import type { FakeDesignHost } from '../../Testing/createFakeDesignHost';
import { DesignCanvas } from '../DesignCanvas';

describe('when tweaking a screen', () => {
    let fake: FakeDesignHost;

    beforeEach(async () => {
        fake = aStartedDesign();
        render(<DesignCanvas host={fake.host} />);
        await askTheChat('Add a screen called Home', 'I added Home.');
        await askTheChat('Give me some tweaks', 'Try the controls in the Tweaks tab.');
        openTab('Tweaks');
    });

    describe('and tweaks have been offered', () => {
        it('should show each control with its label', () => screen.getByRole('combobox', { name: 'Corners' }).tagName.should.equal('SELECT'));
        it('should offer what the design system has', () => [...(screen.getByRole('combobox', { name: 'Corners' }) as HTMLSelectElement).options].map(option => option.value).should.include.members(['Sharp', 'Default', 'Round']));
        it('should have changed nothing yet', () => revisionsOf(sessionOf(fake), 'Home').length.should.equal(1));
    });

    describe('and a control is moved', () => {
        beforeEach(async () => {
            fireEvent.change(screen.getByRole('combobox', { name: 'Corners' }), { target: { value: 'Round' } });
            await waitFor(() => revisionsOf(sessionOf(fake), 'Home').length.should.equal(2));
        });

        it('should record the edit as a revision of the screen', () => currentRevisionOf(sessionOf(fake), 'Home')!.operations.should.deep.equal([{ op: 'profile', key: 'corners', value: 'Round' }]));
        it('should be the designer\'s own edit', () => currentRevisionOf(sessionOf(fake), 'Home')!.author.should.equal('ada'));
        it('should hand the profile to the host to keep', () => fake.profile.current.appearance!.corners!.should.equal('Round'));
        it('should keep the control after it was used', () => sessionOf(fake).tweaks.every(tweak => !tweak.dismissed).should.equal(true));
    });

    describe('and a control is dismissed', () => {
        beforeEach(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Dismiss Corners' }));
            await waitFor(() => (screen.queryByRole('combobox', { name: 'Corners' }) === null).should.equal(true));
        });

        it('should record that it was dismissed', () => sessionOf(fake).tweaks[0]!.dismissed.should.equal(true));
        it('should say there is nothing to tweak', () => Boolean(screen.getByText(/Nothing to tweak yet/)).should.equal(true));
    });
});

describe('when moving a tweak that was offered with no screen in view', () => {
    let fake: FakeDesignHost;

    beforeEach(async () => {
        // The way a story seeds a design: the turns are asked of the AI directly, so the tweaks belong to the design and not to a screen.
        fake = aStartedDesign();
        await askTheFakeAI(fake, 'Add a screen called Home');
        await askTheFakeAI(fake, 'Give me some tweaks');
        render(<DesignCanvas host={fake.host} />);
        openTab('Tweaks');
        fireEvent.change(await screen.findByRole('combobox', { name: 'Corners' }), { target: { value: 'Round' } });
    });

    it('should record the edit on the screen that is in view', async () => { await waitFor(() => revisionsOf(sessionOf(fake), 'Home').length.should.equal(2)); });
    it('should hand the profile to the host to keep', async () => { await waitFor(() => fake.profile.current.appearance!.corners!.should.equal('Round')); });
});

describe('when going back in the history of a screen', () => {
    let fake: FakeDesignHost;
    let first: string;

    beforeEach(async () => {
        fake = aStartedDesign();
        render(<DesignCanvas host={fake.host} />);
        await askTheChat('Add a screen called Home', 'I added Home.');
        first = currentRevisionOf(sessionOf(fake), 'Home')!.id;
        await askTheChat('Give me some tweaks', 'Try the controls in the Tweaks tab.');
        openTab('Tweaks');
        fireEvent.change(screen.getByRole('combobox', { name: 'Corners' }), { target: { value: 'Sharp' } });
        await waitFor(() => revisionsOf(sessionOf(fake), 'Home').length.should.equal(2));
        openTab('History');
    });

    describe('and the screen has two revisions', () => {
        it('should list both, the newest first', () => [...document.querySelectorAll('.design-history__entry')].map(entry => entry.getAttribute('data-revision')).should.deep.equal([currentRevisionOf(sessionOf(fake), 'Home')!.id, first]));
        it('should say what the newest one did', () => Boolean(screen.getByText('Changed the corners to Sharp')).should.equal(true));
        it('should not offer to go back to where it is', () => screen.getAllByRole('button', { name: 'Go back to this' }).length.should.equal(1));
    });

    describe('and an earlier revision is restored', () => {
        beforeEach(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Go back to this' }));
            await waitFor(() => revisionsOf(sessionOf(fake), 'Home').length.should.equal(3));
        });

        it('should record a new revision rather than delete one', () => revisionsOf(sessionOf(fake), 'Home').length.should.equal(3));
        it('should say which revision it restores', () => currentRevisionOf(sessionOf(fake), 'Home')!.restoredFrom!.should.equal(first));
        it('should show the restore at the top of the history', async () => { await waitFor(() => document.querySelector('.design-history__entry')!.getAttribute('data-kind')!.should.equal('restored')); });
    });
});
