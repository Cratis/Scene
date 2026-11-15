// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, GridUnitType, SceneEditKind, type Panel, type SceneDocument, type ScreenTemplate } from '@cratis/scene.model';
import { corePackage } from '@cratis/scene.react';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createTemplateDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { Ownership } from '../../Structure/Ownership';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { applyToSession, openSession } from '../../Session/EditSession';
import { everyElementId } from '../../Selection/sceneTree';
import { toInsertNodeEdit } from '../../Selection/toSceneEdits';
import { composeEditorScreen } from '../composeEditorScreen';
import { isSlotSection, isSlotLabel, slotSectionId } from '../slotSections';
import { resolveOwnership } from '../templateProvenance';

const runtime = createScreenEditorRuntime([corePackage, cratisComponentsPackage], { name: 'test', packages: [] } as never);

// A product grid the way the Screenplay import stores it: the slots it declares, how they share the space, and what it puts in some of them.
const productGrid = (): ScreenTemplate => ({
    name: 'grid',
    slots: [{ name: 'header' }, { name: 'filters' }, { name: 'products' }],
    content: {
        header: [createExternalComponent('grid-title', 'Title', 'title', { text: 'Products' })],
        products: [createExternalComponent('grid-cards', 'Cards', 'card', { title: 'Card' })],
    },
    arrangement: {
        root: {
            kind: 'Column', gap: 16, children: [
                { slotName: 'header' },
                { kind: 'Row', gap: 24, children: [{ slotName: 'filters' }, { slotName: 'products', grow: 1 }] },
            ],
        },
    },
} as unknown as ScreenTemplate);

const documentOf = (): SceneDocument => {
    const base = createTemplateDocument('grid', createPanel(LayoutItem.Stack, 'template-root', 'Template'));
    return { ...base, screenTemplates: [productGrid()] };
};

const context = { catalog: runtime.catalog, scope: { kind: EditingScopeKind.ScreenTemplate, name: 'grid', layout: 'StudioScreen' } };

describe('when authoring a template that declares slots of its own', () => {
    const document = documentOf();
    const composition = composeEditorScreen(document, 'grid');
    const ids = everyElementId(composition.roots);
    const sections = ids.filter(isSlotSection);

    it('should draw a section for every slot the template declares, empty ones too', () => sections.should.have.members(['header', 'filters', 'products'].map(slotSectionId)));
    it('should draw what the template puts in a slot in that slot\'s section', () => ids.should.include.members(['grid-title', 'grid-cards']));
    it('should name each section by its slot', () => ids.filter(isSlotLabel).should.have.length(3));
    it('should add a component to the first slot when no place is named', () => composition.entry!.should.equal(slotSectionId('header')));

    it('should arrange the sections as the template does', () => {
        const root = composition.roots[0] as Panel & { children: Panel[] };
        const row = root.children[1] as unknown as { columns: { width: { unitType: string } }[]; children: Panel[] };
        root.children[0].id.should.equal(slotSectionId('header'));
        row.children.map(child => child.id).should.deep.equal([slotSectionId('filters'), slotSectionId('products')]);
        row.columns.map(column => column.width.unitType).should.deep.equal([GridUnitType.Absolute, GridUnitType.Star]);
    });

    it('should draw each declared slot only once', () => ids.filter((id, index) => ids.indexOf(id) !== index).should.be.empty);
});

describe('when authoring a template whose arrangement leaves a slot out', () => {
    const template = { ...productGrid(), arrangement: { root: { kind: 'Column', gap: 0, children: [{ slotName: 'header' }] } } } as unknown as ScreenTemplate;
    const composition = composeEditorScreen({ ...documentOf(), screenTemplates: [template] }, 'grid');

    it('should still draw the slot below the others', () => everyElementId(composition.roots).filter(isSlotSection).should.deep.equal(['header', 'filters', 'products'].map(slotSectionId)));
});

describe('when authoring a template that declares only the content slot', () => {
    const base = createTemplateDocument('plain', createPanel(LayoutItem.Stack, 'template-root', 'Template'));

    it('should draw the template as before, without sections', () => everyElementId(composeEditorScreen(base, 'plain').roots).should.deep.equal(['template-root']));
});

describe('when asking who owns what in a template drawn in sections', () => {
    const document = documentOf();
    const ownership = resolveOwnership(document, composeEditorScreen(document, 'grid').roots, context);

    it('should let the author drop into a section', () => ownership(slotSectionId('filters')).should.equal(Ownership.Local));
    it('should let the author edit what the template puts in a slot', () => ownership('grid-cards').should.equal(Ownership.Local));
    it('should keep the name of a slot out of the author\'s hands', () => ownership('template-slot-label:header').should.not.equal(Ownership.Local));
});

describe('when dropping a component into an empty slot of a template', () => {
    const document = documentOf();
    const session = openSession(document);
    const edit = toInsertNodeEdit(slotSectionId('filters'), 1, createExternalComponent('search', 'Search', 'inputText'), 'grid');
    const outcome = applyToSession(session, edit, context, 'Add');
    const filters = outcome.document.screenTemplates[0].content?.filters;

    it('should target the slot of the template', () => edit.target.should.equal('screenTemplate:grid#slot:filters'));
    it('should put the component into that slot, at the position it has in the slot and not in the section', () => (filters ?? []).map(element => (element as { id: string }).id).should.deep.equal(['search']));
    it('should leave the other slots as they were', () => outcome.document.screenTemplates[0].content?.header?.should.have.length(1));
    it('should say the edit is an insert', () => edit.kind.should.equal(SceneEditKind.InsertNode));
});
