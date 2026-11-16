// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { currentRevisionOf } from '@cratis/scene.design';
import { aStartedDesign, sessionOf } from '../../given/aStartedDesign';
import { openTab } from '../../given/canvasInteractions';
import { templateChoices } from '../../State/templateSet';
import type { FakeDesignHost } from '../../Testing/createFakeDesignHost';
import { DesignCanvas } from '../DesignCanvas';

describe('when designing screen templates on the canvas', () => {
    let fake: FakeDesignHost;

    beforeEach(async () => {
        fake = aStartedDesign({ mode: 'templates' });
        render(<DesignCanvas host={fake.host} />);
        fireEvent.click(await screen.findByRole('button', { name: 'New screen' }));
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Ledger' } });
        fireEvent.submit(screen.getByRole('form', { name: 'New screen' }));
        await screen.findByRole('article', { name: 'Ledger' });
    });

    describe('and a template has been added', () => {
        it('should record it as a template of the session', () => currentRevisionOf(sessionOf(fake), 'Ledger')!.should.not.be.undefined);
        it('should keep the session in template mode', () => sessionOf(fake).mode.should.equal('templates'));
        it('should draw its slots rather than a screen', () => (document.querySelector('.template-schematic') !== null).should.equal(true));
        it('should show a slot by name', () => document.querySelector('[data-slot="content"]')!.textContent!.should.include('content'));
        it('should mark the primary slot', () => document.querySelector('.template-schematic__slot--primary')!.getAttribute('data-slot')!.should.equal('content'));
        it('should offer no storylines, which are a matter of screens', () => (screen.queryByRole('combobox', { name: 'Storylines' }) === null).should.equal(true));
    });

    describe('and the template is proposed to the design system', () => {
        beforeEach(async () => {
            openTab('Templates');
            fireEvent.click(screen.getByRole('button', { name: 'Propose to the design system' }));
            await waitFor(() => fake.templateProposals.length.should.equal(1));
        });

        it('should send the template\'s current revision to the draft', () => fake.templateProposals[0]!.revisionId.should.equal(currentRevisionOf(sessionOf(fake), 'Ledger')!.id));
        it('should name the template', () => fake.templateProposals[0]!.template.should.equal('Ledger'));
        it('should send it as the session\'s text', () => fake.templateProposals[0]!.text.should.equal(currentRevisionOf(sessionOf(fake), 'Ledger')!.text));
        it('should mark it as proposed', async () => Boolean(await screen.findByText('Proposed')).should.equal(true));
    });
});

describe('when choosing the templates a session may use', () => {
    let fake: FakeDesignHost;
    let names: string[];

    beforeEach(async () => {
        fake = aStartedDesign();
        names = templateChoices(fake.host.catalogue.input(), sessionOf(fake)).map(choice => choice.name);
        render(<DesignCanvas host={fake.host} />);
        openTab('Templates');
        await screen.findByRole('group', { name: 'Templates this design may use' });
    });

    describe('and every template is allowed', () => {
        it('should list the templates of the design system', () => document.querySelectorAll('.design-template-set li').length.should.equal(names.length));
        it('should have no limit in the session', () => (sessionOf(fake).templateSet === undefined).should.equal(true));
    });

    describe('and a template is taken away', () => {
        beforeEach(async () => {
            const first = templateChoices(fake.host.catalogue.input(), sessionOf(fake))[0]!;
            fireEvent.click(screen.getByRole('checkbox', { name: first.label }));
            await waitFor(() => (sessionOf(fake).templateSet !== undefined).should.equal(true));
        });

        it('should record the set that remains', () => sessionOf(fake).templateSet!.length.should.equal(names.length - 1));
        it('should leave the taken template out of the set', () => sessionOf(fake).templateSet!.includes(names[0]!).should.equal(false));
        it('should offer only the allowed templates to a new screen', async () => {
            fireEvent.click(screen.getByRole('button', { name: 'New screen' }));
            const options = [...(await screen.findByRole('combobox', { name: 'Templates' }) as HTMLSelectElement).options].map(option => option.value);
            options.should.not.include(names[0]!);
            options.length.should.equal(names.length - 1);
        });
    });
});
