// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataPack } from '@cratis/scene.model';
import { component, fromQuery } from '../../foundation/templates';
import { ApplicationDocument } from '../ApplicationDocument';
import { createPreviewSampleData } from '../previewSampleData';

const sections = [{ id: 'orders', label: 'Orders' }];
const pack: SampleDataPack = {
    id: 'workspace', title: 'Workspace', locale: 'en-GB', owner: 'own',
    sets: [{ shape: 'ModuleSections', rows: sections }, { shape: 'Deals', rows: [{ name: 'Unused deal' }] }],
};
const shapes = { ModuleSections: { name: 'ModuleSections', fields: [{ name: 'label', type: 'string' }] } };

function workspaceApplication(): ApplicationDocument {
    return {
        layouts: [{ name: 'AppShell', slots: [{ name: 'content' }] }],
        screenTemplates: [],
        screens: [{ name: 'Orders', layout: 'AppShell', screenTemplate: 'WorkspaceScreen', slotContent: {}, forms: [], contributions: [] }],
        uiProfiles: [{ name: 'Preview', targetPlatform: 'web', packages: [], sampleData: { activePack: pack.id, mappings: [], bindings: [] } }],
    };
}

describe('when collecting foundation template queries', () => {
    describe('and a screen uses WorkspaceScreen', () => {
        const source = createPreviewSampleData(workspaceApplication(), { packs: [pack], shapes });

        it('should give ModuleSections the rows of the active pack', () => source.queryResults.should.deep.equal({ ModuleSections: sections }));
        it('should resolve the module navigation binding', () => (source.resolveBinding(fromQuery('ModuleSections')) as unknown[]).should.deep.equal(sections));
        it('should not collect queries of unused blueprint templates', () => Object.hasOwn(source.queryResults, 'Deals').should.equal(false));
    });

    describe('and the pack lacks the foundation query', () => {
        const missing: SampleDataPack = { ...pack, sets: [] };
        const source = createPreviewSampleData(workspaceApplication(), { packs: [missing] });

        it('should leave the query unresolved without a shape', () => source.queryResults.should.deep.equal({}));
        it('should leave the module navigation binding unresolved', () => (source.resolveBinding(fromQuery('ModuleSections')) === undefined).should.equal(true));
    });

    describe('and the blueprint default pack supplies the missing query', () => {
        const missing: SampleDataPack = { ...pack, sets: [] };
        const fallback: SampleDataPack = { ...pack, id: 'default' };
        const source = createPreviewSampleData(workspaceApplication(), { packs: [missing, fallback], blueprintDefaultPack: fallback.id });

        it('should fall through to the blueprint default pack', () => source.queryResults.should.deep.equal({ ModuleSections: sections }));
    });

    describe('and only a shape supplies the missing query', () => {
        const source = createPreviewSampleData(workspaceApplication(), { packs: [], shapes, seed: 7, rowCount: 2 });

        it('should use the existing generated fallback', () => (source.queryResults.ModuleSections as unknown[]).should.deep.equal(source.rows('ModuleSections').rows));
        it('should generate the requested number of rows', () => (source.queryResults.ModuleSections as unknown[]).should.have.lengthOf(2));
    });

    describe('and another blueprint template nests in WorkspaceScreen', () => {
        const application = workspaceApplication();
        application.screens[0].screenTemplate = 'MasterDetailScreen';
        const source = createPreviewSampleData(application, { packs: [pack] });

        it('should collect the outer workspace seed query too', () => (source.queryResults.ModuleSections as unknown[]).should.deep.equal(sections));
    });

    describe('and an own template overrides WorkspaceScreen', () => {
        const application = workspaceApplication();
        application.screenTemplates = [{ name: 'WorkspaceScreen', fitsSlot: 'content', slots: [{ name: 'content' }] }];
        const source = createPreviewSampleData(application, { packs: [pack] });

        it('should not collect the overridden blueprint seed query', () => source.queryResults.should.deep.equal({}));
    });

    describe('and the document declares queries on screens, templates, dialogs and layouts', () => {
        const application = workspaceApplication();
        application.screens[0].slotContent = { moduleContent: [component('screen-query', 'text', { text: fromQuery('ScreenRows') })] };
        application.screenTemplates = [{ name: 'OwnTemplate', slots: [], content: { header: [component('template-query', 'text', { text: fromQuery('TemplateRows') })] } }];
        application.dialogTemplates = [{ name: 'OwnDialog', slots: [], content: { body: [component('dialog-query', 'text', { text: fromQuery('DialogRows') })] } }];
        application.layouts[0].behaviors = [{ bindings: [{ trigger: {}, actions: [], condition: fromQuery('LayoutRows') }] }];
        const names = ['ModuleSections', 'ScreenRows', 'TemplateRows', 'DialogRows', 'LayoutRows'];
        const allQueries: SampleDataPack = { ...pack, sets: names.map(shape => ({ shape, rows: [{ name: shape }] })) };
        const source = createPreviewSampleData(application, { packs: [allQueries] });

        it('should keep resolving every previously collected query', () => source.queryResults.should.deep.equal(Object.fromEntries(names.map(name => [name, [{ name }]]))));
    });
});
