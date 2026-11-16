// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import type { DesignSubject } from '@cratis/scene.design';
import { screenEditorRuntimeForProfile } from '@cratis/scene.editor';
import { jsonScreenplayBridge } from '../../Testing/jsonScreenplayBridge';
import { ScreensOverview } from '../ScreensOverview';
import type { OverviewSubject } from '../overviewScreens';

const runtime = screenEditorRuntimeForProfile(undefined);
const bridge = jsonScreenplayBridge([]);

async function subject(kind: DesignSubject['kind'], id: string, title: string, ...names: string[]): Promise<OverviewSubject> {
    const screens = await Promise.all(names.map(async name => ({
        name,
        document: await bridge.toDocument([{ screen: name, text: JSON.stringify({ screen: { name, layout: 'AppShell', slotContent: {}, forms: [], contributions: [] } }) }], 'screens'),
    })));
    return { subject: { kind, id }, title, screens };
}

describe('when drawing the screens overview', () => {
    let subjects: OverviewSubject[];
    let opened: { subject: DesignSubject; screen?: string | undefined }[];

    beforeEach(async () => {
        opened = [];
        subjects = [await subject('story', 's1', 'Pay an invoice', 'InvoiceList', 'PayInvoice'), await subject('issue', 'i7', 'Overdue banner', 'Banner')];
        render(<ScreensOverview subjects={subjects} runtime={runtime} routing={{ openSubject: (target, screenName) => opened.push({ subject: target, screen: screenName }) }} />);
    });

    it('should list a section for each subject', () => screen.getAllByRole('region').map(region => region.getAttribute('aria-label')).should.include.members(['Pay an invoice', 'Overdue banner']));
    it('should count the screens in the title', () => document.querySelector('.screens-overview__count')!.textContent!.should.equal('3'));
    it('should show each screen of a subject', () => [...document.querySelectorAll('[data-screen]')].map(item => item.getAttribute('data-screen')).should.deep.equal(['InvoiceList', 'PayInvoice', 'Banner']));
    it('should draw no editing controls', () => document.querySelectorAll('textarea, [data-capture]').length.should.equal(0));
    it('should offer to filter when there are several kinds', () => Boolean(screen.getByRole('combobox', { name: 'Kind' })).should.equal(true));

    describe('and a screen is opened', () => {
        beforeEach(() => { fireEvent.click(screen.getByRole('button', { name: 'Open Banner' })); });

        it('should ask the host to open the subject it belongs to', () => opened[0]!.subject.should.deep.equal({ kind: 'issue', id: 'i7' }));
        it('should ask for that screen', () => opened[0]!.screen!.should.equal('Banner'));
    });

    describe('and the list is filtered', () => {
        beforeEach(() => { fireEvent.change(screen.getByRole('searchbox', { name: 'Filter screens' }), { target: { value: 'banner' } }); });

        it('should show only the subject that matches', () => [...document.querySelectorAll('.screens-overview__subject')].length.should.equal(1));
        it('should count what is shown', () => document.querySelector('.screens-overview__count')!.textContent!.should.equal('1'));
    });

    describe('and the host gives it no routing', () => {
        it('should show the names without links', () => {
            document.body.innerHTML = '';
            render(<ScreensOverview subjects={subjects} runtime={runtime} />);
            screen.queryAllByRole('button', { name: /^Open / }).length.should.equal(0);
        });
    });
});
