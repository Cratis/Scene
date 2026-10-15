// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, PackageKind, SampleDataPack, ScreenTemplate } from '@cratis/scene.model';
import { BlueprintSource, verifyTemplateDefinitionOfDone } from '../index';

const arrangement = (...slots: string[]) => ({ root: { kind: 'column', gap: 0, children: slots.map(slotName => ({ slotName })) } }) as unknown as ScreenTemplate['arrangement'];

const done: ScreenTemplate = {
    name: 'ListScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'list' }],
    arrangement: arrangement('header', 'list'),
    content: { list: [{ id: 'l', componentName: 'dataList', properties: { rows: { kind: 'queryResult', query: 'Deals', path: '' } }, slots: {} }] } as unknown as ScreenTemplate['content'],
    displayName: 'List',
    description: 'A searchable collection.',
    metadata: {
        type: 'List', category: 'Foundation / List', thumbnail: 'thumbnails/ListScreen.svg',
        compatibility: { scene: '>=4.0.0' }, attribution: { author: 'Cratis' }, license: 'MIT',
    },
};

const pack = { id: 'p', title: 'P', locale: 'en-GB', owner: 'user', sets: [{ shape: 'Deals', rows: [{ id: 'a', name: 'b' }] }] } as unknown as SampleDataPack;
const sourceOf = (...templates: ScreenTemplate[]): BlueprintSource => ({
    manifest: { name: 'x', version: '1.0.0', kind: PackageKind.Blueprint, dependencies: [], components: [], layouts: [], screenTemplates: templates.map(t => t.name), dialogTemplates: [], themes: [] },
    screenTemplates: templates,
    layouts: [{ name: 'shell', slots: [{ name: 'content' }], arrangement: arrangement('content') } as never],
    files: ['thumbnails/ListScreen.svg'],
});
const verify = (template: ScreenTemplate, withPack = true) => verifyTemplateDefinitionOfDone(template, sourceOf(template), [], { categoryPrefix: 'Foundation /', pack: withPack ? pack : undefined });

describe('when verifying a template is done', () => {
    it('should report nothing for a template that is done', () => verify(done).should.deep.equal([]));

    it('should report a description that is two sentences', () => verify({ ...done, description: 'A list. It filters.' }).should.deep.equal(["Template 'ListScreen' describes itself in more than one sentence, or without a full stop"]));

    it('should report a thumbnail that is not in the package', () =>
        verify({ ...done, metadata: { ...done.metadata!, thumbnail: 'thumbnails/Other.svg' } }).should.deep.equal(["Template 'ListScreen' declares thumbnail 'thumbnails/Other.svg', which is not in the package"]));

    it('should report a category outside the prefix', () =>
        verify({ ...done, metadata: { ...done.metadata!, category: 'Sales / List' } }).should.deep.equal(["Template 'ListScreen' declares category 'Sales / List', which does not start with 'Foundation /'"]));

    it('should report a declared slot the arrangement never places', () =>
        verify({ ...done, slots: [...done.slots, { name: 'footer' }] }).should.deep.equal(["Template 'ListScreen' declares slot 'footer' but its arrangement never places it"]));

    it('should report a template that fits a slot nothing declares', () =>
        verify({ ...done, fitsSlot: 'nowhere' }).should.deep.equal(["Template 'ListScreen' is unplaced: no layout or template declares slot 'nowhere'"]));

    it('should report sample rows written inline', () => {
        const inline = { ...done, content: { list: [{ id: 'l', componentName: 'dataList', properties: { rows: [{ id: 1, name: 'a' }, { id: 2, name: 'b' }] }, slots: {} }] } as unknown as ScreenTemplate['content'] };
        verify(inline).should.deep.equal(["Template 'ListScreen' carries sample rows inline at dataList.rows; preview data belongs in a sample-data pack"]);
    });

    it('should report a query the pack does not answer', () =>
        verify({ ...done, content: { list: [{ id: 'l', componentName: 'dataList', properties: { rows: { kind: 'queryResult', query: 'Missing', path: '' } }, slots: {} }] } as unknown as ScreenTemplate['content'] })
            .should.deep.equal(["Template 'ListScreen' binds to query 'Missing', which sample-data pack 'p' does not answer"]));

    it('should hold a dialog template to the same checklist, with no slot to place and no arrangement to stack', () => {
        const dialog = { name: 'ConfirmDialog', slots: [{ name: 'header' }, { name: 'actions' }], displayName: 'Confirm', description: 'One question and its consequence.', metadata: { ...done.metadata!, type: 'Dialog', category: 'Foundation / Dialog', thumbnail: 'thumbnails/ListScreen.svg' } } as DialogTemplate;
        verifyTemplateDefinitionOfDone(dialog, sourceOf(), [], { categoryPrefix: 'Foundation /' }).should.deep.equal([]);
    });

    it('should report content in a slot a dialog does not declare', () => {
        const dialog = { name: 'ConfirmDialog', slots: [{ name: 'header' }], content: { body: [] }, displayName: 'Confirm', description: 'One question and its consequence.', metadata: { ...done.metadata!, type: 'Dialog', category: 'Foundation / Dialog' } } as unknown as DialogTemplate;
        verifyTemplateDefinitionOfDone(dialog, sourceOf(), [], { categoryPrefix: 'Foundation /' }).should.deep.equal(["Template 'ConfirmDialog' fills slot 'body', which it does not declare"]);
    });

    it('should not check the pack when none is given', () =>
        verify({ ...done, content: { list: [{ id: 'l', componentName: 'dataList', properties: { rows: { kind: 'queryResult', query: 'Missing', path: '' } }, slots: {} }] } as unknown as ScreenTemplate['content'] }, false).should.deep.equal([]));
});
