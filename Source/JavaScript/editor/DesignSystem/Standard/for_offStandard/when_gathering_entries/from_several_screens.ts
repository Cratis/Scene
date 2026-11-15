// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { defaultDesignSystemEditorStrings } from '../../../defaultDesignSystemEditorStrings';
import { issueFor, issueLine, offStandardEntries, offStandardEntryOf, proposalBrief, replacementFor, type OffStandardScreen } from '../../offStandard';

const screens: OffStandardScreen[] = [
    { id: 'a', title: 'Orders', values: [{ kind: 'color', value: '#123456', suggestion: '--color-primary', count: 2 }, { kind: 'component', value: 'Chip', suggestion: '', count: 1 }] },
    { id: 'b', title: 'Invoices', values: [{ kind: 'color', value: '#123456', suggestion: '--color-primary', count: 3 }] },
    { id: 'c', title: 'Customers', values: [] },
];

describe('when gathering entries from several screens', () => {
    const entries = offStandardEntries(screens);

    it('should make one entry for a value used on several screens', () => entries.filter(entry => entry.value === '#123456').should.have.length(1));
    it('should count how often the value is used in all', () => entries[0].total.should.equal(5));
    it('should name every screen that uses it', () => entries[0].places.map(place => place.title).should.deep.equal(['Orders', 'Invoices']));
    it('should keep what the screen is called and how often it uses the value', () => entries[0].places[1].should.deep.equal({ screen: 'b', title: 'Invoices', count: 3 }));
    it('should put the most used first', () => entries.map(entry => entry.value).should.deep.equal(['#123456', 'Chip']));
    it('should keep a suggestion', () => entries[0].suggestion.should.equal('--color-primary'));
    it('should not make an entry for a screen with nothing off the standard', () => entries.flatMap(entry => entry.places).some(place => place.screen === 'c').should.be.false);
    it('should keep a kind of thing apart from another with the same name', () => offStandardEntries([{ id: 'a', title: 'A', values: [{ kind: 'color', value: 'x', suggestion: '', count: 1 }, { kind: 'token', value: 'x', suggestion: '', count: 1 }] }]).should.have.length(2));
    it('should order values used as often by name', () => offStandardEntries([{ id: 'a', title: 'A', values: [{ kind: 'color', value: 'b', suggestion: '', count: 1 }, { kind: 'color', value: 'a', suggestion: '', count: 1 }] }]).map(entry => entry.value).should.deep.equal(['a', 'b']));

    describe('and one screen proposes its own', () => {
        const own = offStandardEntryOf(screens[0], screens[0].values[0]);

        it('should have the screen as its one place', () => own.places.should.deep.equal([{ screen: 'a', title: 'Orders', count: 2 }]));
        it('should count only that screen', () => own.total.should.equal(2));
    });

    describe('and an issue is raised', () => {
        it('should say what, how often, where and what to use instead', () => issueLine(entries[0]).should.equal('color `#123456` (5 times) in Orders, Invoices; use `--color-primary`'));
        it('should say no replacement when there is none to suggest', () => issueLine(entries[1]).should.equal('component `Chip` (1 times) in Orders'));
        it('should be titled for the value when it is about one', () => issueFor([entries[0]], defaultDesignSystemEditorStrings.standard).title.should.equal('Use the design system for #123456'));
        it('should be titled for how many when it is about several', () => issueFor(entries, defaultDesignSystemEditorStrings.standard).title.should.equal('Bring 2 off-standard values back to the design system'));
        it('should carry a line for each value', () => issueFor(entries, defaultDesignSystemEditorStrings.standard).findings.should.have.length(2));
    });

    describe('and a value is proposed to the design system', () => {
        it('should say where it is used', () => proposalBrief(entries[0]).should.contain('Orders, Invoices'));
        it('should ask for it to be added', () => proposalBrief(entries[0]).should.contain('Add it to the design system'));
    });

    describe('and a token is written in place of a value', () => {
        it('should refer to a custom property', () => replacementFor('--color-primary').should.equal('var(--color-primary)'));
        it('should leave a reference as it is', () => replacementFor('var(--color-primary)').should.equal('var(--color-primary)'));
    });
});
