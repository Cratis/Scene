// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystemConflictEntry } from '../Conflicts/DesignSystemConflict';
import type { DesignSystemPreview } from '../Previewing/DesignSystemPreview';
import { partChange, wordChange } from '../Resolving/designEdits';
import type { FakeDesignSystemHost } from '../Testing/createFakeDesignSystemHost';
import { drawEditor, type DrawnEditor } from './given/draw';

const view = { version: 'draft', section: 'changes' } as const;

const startDraft = async (host: FakeDesignSystemHost) => { await host.startDraft(); };
const startAndChange = async (host: FakeDesignSystemHost) => {
    await host.startDraft();
    await host.changeDraft(2, 1, [wordChange('voice', 'tone', 'Warm'), partChange('Button', 'primary', 'hover', 'background', 'color.hover')]);
};

const conflict: DesignSystemConflictEntry = {
    version: 2,
    chosen: '',
    decidedBy: '',
    issueRaised: false,
    conflict: { id: 'grey', kind: 'color', title: 'Two greys for borders', options: [{ value: '#ccc', count: 12, places: [] }, { value: '#cdcdcd', count: 1, places: [] }] },
};

const preview: DesignSystemPreview = {
    different: 1,
    broken: 0,
    problem: '',
    screens: [{ screen: 'layout:AppShell', name: 'AppShell', different: true, broken: false, problems: [], images: [{ version: 'draft', mode: 'light', image: '/draft.png' }] }],
};

describe('when drawing the changes of a draft', () => {
    describe('and nothing was changed', () => {
        let drawn: DrawnEditor;

        beforeEach(async () => { drawn = await drawEditor(view, {}, startDraft); });

        it('should say nothing differs', () => drawn.markup.should.contain('Nothing differs'));
        it('should say what it is against and who wrote it', () => drawn.markup.should.contain('Against the active v1. Written by ada.'));
        it('should offer no activation to the person who wrote it', () => {
            drawn.markup.should.contain('You wrote part of this draft. Ask someone else to review and activate it.');
            drawn.markup.should.contain('Activate v2');
        });
        it('should offer to put it up for review', () => drawn.markup.should.contain('Submit draft for review'));
        it('should offer to discard it', () => drawn.markup.should.contain('Discard draft'));
    });

    describe('and things were changed', () => {
        let drawn: DrawnEditor;

        beforeEach(async () => { drawn = await drawEditor(view, {}, startAndChange); });

        it('should list what changed', () => {
            drawn.markup.should.contain('voice tone');
            drawn.markup.should.contain('Button primary hover background');
        });
        it('should say how it changed', () => {
            drawn.markup.should.contain('changed');
            drawn.markup.should.contain('added');
        });
        it('should show what a value was and what it is', () => drawn.markup.should.contain('Plain and direct. Say what happened, then what to do. → Warm'));
    });

    describe('and someone else is looking', () => {
        it('should let them activate it', async () => {
            const drawn = await drawEditor(view, { person: 'ada' }, async host => { await host.startDraft(); host.actAs('grace'); });
            drawn.markup.should.not.contain('You wrote part of this draft');
        });
    });

    describe('and the draft was put up for review', () => {
        let drawn: DrawnEditor;

        beforeEach(async () => {
            drawn = await drawEditor(view, {}, async host => {
                await startAndChange(host);
                host.actAs('grace');
                await host.submitDraft!(2, 2);
            });
        });

        it('should say who submitted it', () => drawn.markup.should.contain('Waiting for review - submitted by grace'));
        it('should offer no second submission', () => drawn.markup.should.not.contain('Submit draft for review'));
    });

    describe('and the host has no review step', () => {
        it('should not offer to put it up for review', async () => {
            const drawn = await drawEditor(view, { review: false }, startDraft);
            drawn.markup.should.not.contain('Submit draft for review');
        });
    });

    describe('and the host finds conflicts', () => {
        let drawn: DrawnEditor;

        beforeEach(async () => { drawn = await drawEditor(view, { conflicts: [conflict] }, startDraft); });

        it('should draw them above the changes', () => drawn.markup.indexOf('Conflicts to decide').should.be.lessThan(drawn.markup.indexOf('Changes in draft v2')));
        it('should say how many wait', () => drawn.markup.should.contain('1 value is used two ways in the code. Keep one - the draft follows.'));
        it('should offer to keep each value', () => ['Keep #ccc', 'Keep #cdcdcd'].forEach(text => drawn.markup.should.contain(text)));
        it('should say how often a value is used', () => drawn.markup.should.contain('12 times'));
    });

    describe('and the host finds no conflicts', () => {
        it('should draw no panel for them', async () => {
            const drawn = await drawEditor(view, {}, startDraft);
            drawn.markup.should.not.contain('Conflicts to decide');
        });
    });

    describe('and a conflict was decided', () => {
        it('should say who decided and offer to raise an issue for the code to change', async () => {
            const drawn = await drawEditor(view, { conflicts: [{ ...conflict, chosen: '#ccc', decidedBy: 'ada' }] }, startDraft);
            ['Decided by ada', 'Kept', 'Raise an issue for the 1 places to change'].forEach(text => drawn.markup.should.contain(text));
        });
        it('should not offer to raise an issue when the host cannot', async () => {
            const drawn = await drawEditor(view, { conflicts: [{ ...conflict, chosen: '#ccc', decidedBy: 'ada' }] }, startDraft, host => ({ ...host, conflicts: { decide: host.conflicts!.decide } }));
            drawn.markup.should.not.contain('Raise an issue');
        });
    });

    describe('and the host can draw the screens', () => {
        it('should offer to preview on the screens', async () => {
            const drawn = await drawEditor(view, { preview }, startDraft);
            drawn.markup.should.contain('Preview on screens');
        });
        it('should say when it cannot draw now', async () => {
            const drawn = await drawEditor(view, { preview, previewAvailable: false }, startDraft);
            drawn.markup.should.contain('Previewing needs a browser service');
        });
    });

    describe('and the host cannot draw the screens', () => {
        it('should offer no preview', async () => {
            const drawn = await drawEditor(view, {}, startDraft);
            drawn.markup.should.not.contain('Preview on screens');
        });
    });
});
