// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { everyElementId } from '../../Selection/sceneTree';
import { isSlotLabel, isSlotSection, slotSectionId } from '../slotSections';
import { ownTemplateElement } from '../ownTemplateElement';

const grid = {
    name: 'grid-id',
    slots: [{ name: 'header' }, { name: 'filters' }, { name: 'products' }],
    content: { header: [createExternalComponent('grid-title', 'Title', 'title', { text: 'Products' })], products: [createExternalComponent('grid-cards', 'Cards', 'card', { title: 'Mug' })] },
    arrangement: { root: { kind: 'Column', gap: 8, children: [{ slotName: 'header' }, { kind: 'Row', gap: 8, children: [{ slotName: 'filters' }, { slotName: 'products', grow: 1 }] }] } },
};
const textOf = (...templates: unknown[]) => JSON.stringify({ layouts: [], screenTemplates: templates, dialogTemplates: [], screens: [], exposures: [], instanceContributions: [] } as unknown as SceneDocument);

describe('when drawing an own template that declares slots', () => {
    const element = ownTemplateElement(textOf(grid), 'grid-id');
    const ids = element ? everyElementId([element]) : [];

    it('should draw what the template puts in its slots', () => ids.should.include.members(['grid-title', 'grid-cards']));
    it('should draw every slot in a section of its own', () => ids.filter(isSlotSection).should.have.members(['header', 'filters', 'products'].map(slotSectionId)));
    it('should not name the slots - a preview draws what is in them', () => ids.filter(isSlotLabel).should.be.empty);
});

describe('when drawing an own template that declares only the content slot', () => {
    const element = ownTemplateElement(textOf({ name: 'plain', slots: [{ name: 'content' }], content: { content: [createExternalComponent('nav', 'Nav', 'navigationBar')] } }), 'plain');

    it('should draw the content', () => everyElementId([element!]).should.include('nav'));
});

describe('when drawing an own template that puts nothing anywhere', () => {
    it('should draw nothing rather than empty places', () => (ownTemplateElement(textOf({ ...grid, content: {} }), 'grid-id') === undefined).should.be.true);
});

describe('when drawing a document that is not a template', () => {
    it('should draw nothing for no text', () => (ownTemplateElement(undefined, 'x') === undefined).should.be.true);
    it('should draw nothing for text that is not json', () => (ownTemplateElement('{ nope', 'x') === undefined).should.be.true);
    it('should draw nothing for a document of several templates none of which is it', () => (ownTemplateElement(textOf(grid, { ...grid, name: 'b' }), 'other') === undefined).should.be.true);
});
