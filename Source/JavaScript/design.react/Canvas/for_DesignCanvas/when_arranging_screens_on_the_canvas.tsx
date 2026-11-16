// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { foldDesignSession } from '@cratis/scene.design';
import { aStartedDesign, sessionOf } from '../../given/aStartedDesign';
import type { FakeDesignHost } from '../../Testing/createFakeDesignHost';
import { DesignCanvas } from '../DesignCanvas';

const ask = async (prompt: string, arrives: string) => {
    fireEvent.change(screen.getByLabelText('Describe what to design or change'), { target: { value: prompt } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    await screen.findByRole('article', { name: arrives });
    await waitFor(() => screen.getByRole('button', { name: 'Send' }));
};

const order = () => [...document.querySelectorAll('[data-artboard]')].map(element => element.getAttribute('data-artboard'));

describe('when arranging screens on the canvas', () => {
    let fake: FakeDesignHost;

    beforeEach(async () => {
        fake = aStartedDesign({ storylines: [] });
        render(<DesignCanvas host={fake.host} />);
        await ask('Add a screen called List', 'List');
        await ask('Add a screen called Details', 'Details');
        await ask('Add a screen called Pay', 'Pay');
    });

    describe('and nothing has been arranged', () => {
        it('should lay the screens out in the order they were added', () => order().should.deep.equal(['List', 'Details', 'Pay']));
        it('should join each to the next with an arrow', () => document.querySelectorAll('.design-canvas__arrow').length.should.equal(2));
        it('should not offer to move the first earlier', () => (screen.getByRole('button', { name: 'Move List earlier' }) as HTMLButtonElement).disabled.should.equal(true));
        it('should not offer to move the last later', () => (screen.getByRole('button', { name: 'Move Pay later' }) as HTMLButtonElement).disabled.should.equal(true));
    });

    describe('and a screen is moved earlier', () => {
        beforeEach(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Move Pay earlier' }));
            await waitFor(() => order().should.deep.equal(['List', 'Pay', 'Details']));
        });

        it('should record the new order in the session', () => sessionOf(fake).screens.map(entry => entry.screen).should.deep.equal(['List', 'Pay', 'Details']));
        it('should keep the revisions of every screen', () => sessionOf(fake).revisions.length.should.equal(3));
    });

    describe('and the host keeps storylines', () => {
        beforeEach(async () => {
            fireEvent.change(screen.getByLabelText('New storyline'), { target: { value: 'Declined' } });
            fireEvent.click(screen.getByRole('button', { name: '+' }));
            await waitFor(() => (screen.getByRole('combobox', { name: 'Storylines' }) as HTMLSelectElement).value.should.equal('Declined'));
        });

        it('should save the new storyline with the host', () => fake.storylines.map(storyline => storyline.name).should.deep.equal(['Declined']));
        it('should start it empty, so no screen is laid out', () => order().should.be.empty);

        describe('and a screen is taken into it', () => {
            beforeEach(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Pay' }));
                fireEvent.click(screen.getByRole('checkbox', { name: 'Pay' }));
                await waitFor(() => order().should.deep.equal(['Pay']));
            });

            it('should lay out only the storyline\'s screens', () => order().should.deep.equal(['Pay']));
            it('should keep the screen in the design', () => sessionOf(fake).screens.length.should.equal(3));
            it('should save the steps with the host', () => fake.storylines[0]!.steps.should.deep.equal(['Pay']));

            describe('and the default storyline is chosen again', () => {
                beforeEach(async () => {
                    fireEvent.change(screen.getByRole('combobox', { name: 'Storylines' }), { target: { value: 'Default' } });
                    await waitFor(() => order().length.should.equal(3));
                });

                it('should show every screen', () => order().should.deep.equal(['List', 'Details', 'Pay']));
            });
        });
    });

    describe('and the session is read back from its events', () => {
        it('should hold the same screens', () => foldDesignSession(fake.store.getEvents())!.screens.length.should.equal(3));
    });
});
