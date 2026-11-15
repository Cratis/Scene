// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { contentSlot, createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { collectProfileUsage, collectProfileUsages } from '../collectProfileUsages';

const screen = () => createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', [
    createExternalComponent('b', 'Save', 'button'),
    createPanel(LayoutItem.Row, 'row', 'Row', [createExternalComponent('t', 'Tools', 'dataTable')]),
]), 'Shell');

describe('when collecting what a screen relies on', () => {
    const usage = collectProfileUsage({ name: 'Checkout', document: screen() });

    it('should name the screen', () => usage.screen.should.equal('Checkout'));
    it('should list every component at any depth, once', () => usage.components.should.have.members(['button', 'dataTable']));
    it('should list the template the screen uses', () => usage.screenTemplates.should.deep.equal(['Shell']));
    it('should not list the editor\'s own layout, which every profile has', () => usage.layouts.should.deep.equal([]));
    it('should list no slots of its own layout', () => usage.slots.should.deep.equal([]));
});

describe('when a screen carries its own template', () => {
    const document = { ...screen(), screenTemplates: [{ name: 'Shell', slots: [{ name: contentSlot }], content: {} }] };

    it('should not depend on the profile for a template it defines itself', () => collectProfileUsage({ name: 'S', document }).screenTemplates.should.deep.equal([]));
});

describe('when collecting from stored screens', () => {
    const usages = collectProfileUsages([
        { name: 'Good', document: JSON.stringify(screen()) },
        { name: 'Empty', document: undefined },
        { name: 'Broken', document: '{not json' },
    ]);

    it('should keep the screens it can read', () => usages.map(usage => usage.screen).should.deep.equal(['Good']));
});

describe('when a screen is filled from a dialog template of the packages', () => {
    const dialogScreen = { ...screen(), screens: screen().screens.map(entry => ({ ...entry, screenTemplate: 'QuickCreateDialog' })) };
    const usage = collectProfileUsage({ name: 'NewProduct', document: dialogScreen }, new Set(['QuickCreateDialog']));

    it('should look the template up among the dialog templates', () => usage.dialogTemplates.should.deep.equal(['QuickCreateDialog']));
    it('should not ask the screen templates for it', () => usage.screenTemplates.should.deep.equal([]));
});
