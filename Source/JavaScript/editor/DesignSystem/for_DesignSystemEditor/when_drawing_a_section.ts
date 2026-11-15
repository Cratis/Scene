// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { FakeDesignSystemHost } from '../Testing/createFakeDesignSystemHost';
import { drawEditor, type DrawnEditor } from './given/draw';

const startDraft = async (host: FakeDesignSystemHost) => { await host.startDraft(); };

describe('when drawing a section of the active version', () => {
    describe('and it is a foundation', () => {
        let drawn: DrawnEditor;

        beforeEach(async () => { drawn = await drawEditor({ section: 'color' }); });

        it('should draw each token as what it is', () => drawn.markup.should.contain('aria-label="primary is #1d4ed8"'));
        it('should say what a token is for', () => drawn.markup.should.contain('brand accent, active states, primary buttons'));
        it('should show the value read-only', () => {
            drawn.markup.should.contain('#1d4ed8');
            drawn.markup.should.not.contain('aria-label="Value of color.primary"');
        });
        it('should offer no way to add a token', () => drawn.markup.should.not.contain('placeholder="what it is for"'));
    });

    describe('and a theme and mode are asked for', () => {
        it('should draw the values of that theme and mode', async () => {
            const drawn = await drawEditor({ section: 'color', theme: 'Brand', mode: 'light' });
            drawn.markup.should.contain('aria-label="primary is #38bdf8"');
        });
    });

    describe('and it is the themes', () => {
        let drawn: DrawnEditor;

        beforeEach(async () => { drawn = await drawEditor({ section: 'themes' }); });

        it('should list the themes and mark the default', () => {
            drawn.markup.should.contain('Brand');
            drawn.markup.should.contain('Default');
        });
        it('should flag the theme that is hard to read', () => drawn.markup.should.contain('Hard to read'));
        it('should describe a theme', () => drawn.markup.should.contain('A lighter variant for partner sites.'));
        it('should offer no change to a theme', () => {
            drawn.markup.should.not.contain('Make default');
            drawn.markup.should.not.contain('Add as a copy of');
        });
    });

    describe('and it is the components', () => {
        let drawn: DrawnEditor;

        beforeEach(async () => { drawn = await drawEditor({ section: 'components', component: 'Menu' }); });

        it('should draw every state of the component', () => ['default', 'hover', 'selected'].forEach(state => drawn.markup.should.contain(`>${state}</th>`)));
        it('should draw every mode of each state', () => {
            drawn.markup.should.contain('data-mode="light"');
            drawn.markup.should.contain('data-mode="dark"');
        });
        it('should say how readable the text is', () => drawn.markup.should.match(/\d+\.\d:1/));
        it('should say where the Screenplay names the component', () => drawn.markup.should.contain('The Screenplay does not name Menu'));
        it('should offer no hand editing', () => drawn.markup.should.not.contain('Edit by hand'));
    });

    describe('and the theme shown has a pair that is hard to read', () => {
        it('should say the text is too low to read', async () => {
            const drawn = await drawEditor({ section: 'components', component: 'Shell', theme: 'Brand' });
            drawn.markup.should.contain('too low to read');
        });
    });

    describe('and it is the words', () => {
        it('should draw the voice and the naming', async () => {
            const drawn = await drawEditor({ section: 'words' });
            ['Voice', 'Naming', 'tone', 'Plain and direct', 'customer', 'Client'].forEach(text => drawn.markup.should.contain(text));
        });
    });

    describe('and it is the Screenplay', () => {
        let drawn: DrawnEditor;

        beforeEach(async () => { drawn = await drawEditor({ section: 'screenplay' }); });

        it('should say how applications are drawn', () => ['UI profile', 'Root template', 'Shell', 'PrimeReact, Cratis.Blueprint.Default'].forEach(text => drawn.markup.should.contain(text)));
        it('should list the layouts and templates', () => ['AppShell', 'Workspaces.Sheet', 'Workspaces.Confirm'].forEach(text => drawn.markup.should.contain(text)));
        it('should offer the source as a file named for the version', () => drawn.markup.should.contain('Download design-system-v1.play'));
    });

    describe('and a section the host added', () => {
        it('should draw the host\'s own content in the navigation and the content', async () => {
            const drawn = await drawEditor(
                { section: 'assistant' },
                {},
                async () => {},
                host => Object.assign(host, { sections: [{ id: 'assistant', label: 'Assistant', group: 'Draft', render: () => 'Ask for a change in words.' }] }));
            drawn.markup.should.contain('Assistant');
            drawn.markup.should.contain('Ask for a change in words.');
        });
    });
});

describe('when drawing a section of a draft', () => {
    describe('and it is a foundation', () => {
        let drawn: DrawnEditor;

        beforeEach(async () => { drawn = await drawEditor({ version: 'draft', section: 'color' }, {}, startDraft); });

        it('should say who started the draft', () => drawn.markup.should.contain('Draft v2 by ada'));
        it('should switch between the active version and the draft', () => drawn.markup.should.contain('Version shown'));
        it('should let a value be changed in place', () => drawn.markup.should.contain('aria-label="Value of color.primary"'));
        it('should let a token be added', () => drawn.markup.should.contain('placeholder="what it is for"'));
        it('should offer the changes', () => drawn.markup.should.contain('Changes in draft'));
    });

    describe('and it is the themes', () => {
        it('should let themes be added, removed and made the default', async () => {
            const drawn = await drawEditor({ version: 'draft', section: 'themes' }, {}, startDraft);
            ['Make default', 'Remove', 'Add as a copy of Acme'].forEach(text => drawn.markup.should.contain(text));
        });
    });

    describe('and it is the components', () => {
        it('should offer to edit a variant by hand', async () => {
            const drawn = await drawEditor({ version: 'draft', section: 'components', component: 'Button' }, {}, startDraft);
            drawn.markup.should.contain('Edit Button primary by hand');
        });
        it('should draw the variant\'s parts when one is being edited', async () => {
            const drawn = await drawEditor({ version: 'draft', section: 'components', component: 'Button', variant: 'primary' }, {}, startDraft);
            ['Editing Button · primary', 'aria-label="background of Button primary"', '<option value="color.primary" selected="">color.primary</option>'].forEach(text => drawn.markup.should.contain(text));
        });
    });

    describe('and it is the words', () => {
        it('should let a word be added', async () => {
            const drawn = await drawEditor({ version: 'draft', section: 'words' }, {}, startDraft);
            drawn.markup.should.contain('aria-label="Text of voice tone"');
        });
    });
});
