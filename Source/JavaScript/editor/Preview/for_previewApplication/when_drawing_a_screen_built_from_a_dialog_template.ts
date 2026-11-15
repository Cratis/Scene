// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DialogTemplate, Screen, ScreenTemplate } from '@cratis/scene.model';
import { dialogTemplatesUsedBy, withoutSeededSlots } from '../previewApplication';

const screen = (name: string, screenTemplate: string): Screen => ({ name, layout: 'AppShell', screenTemplate, slotContent: {} } as unknown as Screen);
const dialog = (name: string): DialogTemplate => ({ name, slots: [{ name: 'body' }] });
const screenTemplate = (name: string): ScreenTemplate => ({ name, slots: [{ name: 'content' }] });
const runtime = (...templates: DialogTemplate[]) => ({ bundles: [{ dialogTemplates: templates } as never] });

describe('when drawing a screen built from a dialog template', () => {
    const scene = { screenTemplates: [screenTemplate('ProductGrid')], dialogTemplates: [dialog('OwnDialog')] };
    const screens = [screen('Application.States', 'QuickCreateDialog'), screen('Shop.Own', 'OwnDialog'), screen('Shop.Grid', 'ProductGrid'), screen('Shop.Plain', 'ListScreen')];
    const used = dialogTemplatesUsedBy(scene, runtime(dialog('QuickCreateDialog'), dialog('ConfirmDialog')), screens);

    it('should hand the host the blueprint dialog template a screen names', () => used.map(template => template.name).should.include('QuickCreateDialog'));
    it('should hand the host the dialog template the document declares itself', () => used.map(template => template.name).should.include('OwnDialog'));
    it('should not hand the host a dialog template no screen uses', () => used.map(template => template.name).should.not.include('ConfirmDialog'));
    it('should not hand the host a template that is a screen template of the document', () => dialogTemplatesUsedBy({ screenTemplates: [screenTemplate('QuickCreateDialog')], dialogTemplates: [] }, runtime(dialog('QuickCreateDialog')), screens).should.be.empty);
    it('should hand the host each dialog template once', () => dialogTemplatesUsedBy(scene, runtime(dialog('QuickCreateDialog'), dialog('QuickCreateDialog')), screens).filter(template => template.name === 'QuickCreateDialog').should.have.length(1));
});

describe('when drawing a screen that fills only some of the slots of its template', () => {
    const template = { name: 'ListScreen', slots: [{ name: 'header' }, { name: 'filters' }, { name: 'list' }] } as unknown as ScreenTemplate;
    const filled = { name: 'Orders', layout: 'AppShell', screenTemplate: 'ListScreen', slotContent: { header: [], list: [{ id: 'table' }] } } as unknown as Screen;
    const own = { name: 'Plain', layout: 'AppShell', slotContent: {} } as unknown as Screen;
    const [orders, plain] = withoutSeededSlots([filled, own], [template]);

    it('should leave the slot it does not fill explicitly empty', () => orders.slotContent.filters!.should.deep.equal([]));
    it('should keep the slots it fills', () => orders.slotContent.list!.should.have.length(1));
    it('should leave a screen with no template as it is', () => plain.should.equal(own));
    it('should leave a screen whose template is unknown as it is', () => withoutSeededSlots([filled], []).should.deep.equal([filled]));
});
