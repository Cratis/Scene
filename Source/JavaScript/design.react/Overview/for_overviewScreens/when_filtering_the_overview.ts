// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { countScreens, filterOverview, kindsOf, overviewScreenKey, type OverviewSubject } from '../overviewScreens';

const document = {} as SceneDocument;
const subjects: OverviewSubject[] = [
    { subject: { kind: 'story', id: 's1' }, title: 'Pay an invoice', screens: [{ name: 'InvoiceList', document }, { name: 'PayInvoice', document, caption: 'FormScreen' }] },
    { subject: { kind: 'issue', id: 'i7' }, title: 'Overdue banner', screens: [{ name: 'InvoiceList', document }] },
    { subject: { kind: 'story', id: 's2' }, title: 'Empty story', screens: [] },
];

describe('when filtering the screens overview', () => {
    describe('and nothing narrows it', () => {
        const shown = filterOverview(subjects);

        it('should leave out subjects with no screens', () => shown.map(entry => entry.subject.id).should.deep.equal(['s1', 'i7']));
        it('should count the screens across subjects', () => countScreens(shown).should.equal(3));
    });

    describe('and a word is in the title of a subject', () => {
        it('should keep all of its screens', () => filterOverview(subjects, { text: 'invoice' }).find(entry => entry.subject.id === 's1')!.screens.length.should.equal(2));
    });

    describe('and a word is in the name of a screen', () => {
        const shown = filterOverview(subjects, { text: 'payinvoice' });

        it('should keep the subjects with such a screen', () => shown.map(entry => entry.subject.id).should.deep.equal(['s1']));
        it('should keep only the screens that match', () => shown[0]!.screens.map(screen => screen.name).should.deep.equal(['PayInvoice']));
    });

    describe('and a word is in the caption of a screen', () => {
        it('should match it', () => filterOverview(subjects, { text: 'formscreen' })[0]!.screens.map(screen => screen.name).should.deep.equal(['PayInvoice']));
    });

    describe('and several words are given', () => {
        it('should need all of them', () => filterOverview(subjects, { text: 'overdue list' }).map(entry => entry.subject.id).should.deep.equal(['i7']));
    });

    describe('and a kind is chosen', () => {
        it('should keep only that kind', () => filterOverview(subjects, { kind: 'issue' }).map(entry => entry.subject.id).should.deep.equal(['i7']));
    });
});

describe('when asking what the overview holds', () => {
    it('should list the kinds in the order they are met', () => kindsOf(subjects).should.deep.equal(['story', 'issue']));
    it('should make a key from the subject and the screen', () => overviewScreenKey({ kind: 'story', id: 's1' }, 'Home').should.equal('story:s1/Home'));
});
