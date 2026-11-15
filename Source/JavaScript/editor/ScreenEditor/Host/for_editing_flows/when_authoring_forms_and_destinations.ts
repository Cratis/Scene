// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode, FormWidthUnit, SlotRole, type Form, type SceneDocument } from '@cratis/scene.model';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { changeDocumentInSession, markSaved, openSession, redo, resetSession, undo } from '../../Session/EditSession';

interface NavigationElement {
    id: string;
    properties: { items: { id: string; values: Record<string, unknown> }[] };
}

interface RootElement {
    children: NavigationElement[];
}

const form: Form = {
    name: 'CreateOrder',
    forCommand: 'CreateOrder',
    generationMode: FormGenerationMode.Manual,
    layout: {
        columns: [{ index: 1, width: { unit: FormWidthUnit.Fraction, value: 1 } }, { index: 2, width: { unit: FormWidthUnit.Fraction, value: 2 } }],
        placements: [
            { field: 'customerName', row: 1, column: 1, rowSpan: 1, columnSpan: 1 },
            { field: 'amount', row: 1, column: 2, rowSpan: 1, columnSpan: 1, width: { unit: FormWidthUnit.Percent, value: 75 } },
        ],
        columnGap: { unit: FormWidthUnit.Pixels, value: 24 },
        rowGap: { unit: FormWidthUnit.Pixels, value: 12 },
    },
    fields: [
        { name: 'customerName', placement: { field: 'customerName', row: 1, column: 1, rowSpan: 1, columnSpan: 1 } },
        { name: 'amount', sourceProperty: 'total', label: 'Total', placement: { field: 'amount', row: 1, column: 2, rowSpan: 1, columnSpan: 1, width: { unit: FormWidthUnit.Percent, value: 75 } } },
    ],
};

function documentWithNavigation(): SceneDocument {
    const nav = createExternalComponent('nav', 'Navigation', 'navigationBar', {
        items: [{ id: 'orders', values: { label: 'Orders', destination: { screen: 'Orders', route: '/orders/:id', slot: 'details', dialog: 'OrderDialog' } } }],
    });
    return createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [nav]));
}

function navigationOf(document: SceneDocument): NavigationElement {
    return (((document.screens[0].slotContent.content[0] as unknown) as RootElement).children[0]);
}

describe('when authoring forms and navigation destinations through the editor session', () => {
    const base = documentWithNavigation();
    const session = markSaved(changeDocumentInSession(openSession(base), { ...base, screens: [{ ...base.screens[0], forms: [form] }] }, 'Author screen'));
    const templateDocument: SceneDocument = {
        ...session.document,
        screenTemplates: [{ name: 'Shell', slots: [{ name: 'content' }, { name: 'details', description: 'Side panel', routed: true }, { name: 'dialog', description: 'Dialog host', role: SlotRole.Panel }] }],
        dialogTemplates: [{ name: 'OrderDialog', slots: [{ name: 'content' }], displayName: 'Order details', description: 'Shows order details', behaviors: [] }],
        exposures: [{ owner: 'Shell', properties: [{ component: 'nav', path: 'items', label: 'Toolbar items' }] }],
        instanceContributions: [{ instance: 'screen:Screen', component: 'nav', path: 'items', items: [{ id: 'global-orders', values: { label: 'Orders', destination: { route: '/orders' } } }] }],
    };
    const withTemplateSlots = markSaved(changeDocumentInSession(session, templateDocument, 'Configure slots and dialogs'));
    const saved = JSON.stringify(withTemplateSlots.document);
    const reloaded = resetSession(JSON.parse(saved) as SceneDocument);
    const screen = reloaded.document.screens[0];
    const navigation = navigationOf(reloaded.document);

    it('should accept the authoring edits', () => withTemplateSlots.diagnostics.should.deep.equal([]));
    it('should save and reload manual form generation mode', () => screen.forms[0].generationMode!.should.equal(FormGenerationMode.Manual));
    it('should save and reload unequal column geometry', () => screen.forms[0].layout!.columns[1].width!.should.deep.equal({ unit: FormWidthUnit.Fraction, value: 2 }));
    it('should save and reload row and column gaps', () => screen.forms[0].layout!.columnGap!.should.deep.equal({ unit: FormWidthUnit.Pixels, value: 24 }));
    it('should save and reload field placement geometry', () => screen.forms[0].layout!.placements[1].should.deep.equal({ field: 'amount', row: 1, column: 2, rowSpan: 1, columnSpan: 1, width: { unit: FormWidthUnit.Percent, value: 75 } }));
    it('should save and reload the generated and authored fields', () => screen.forms[0].fields.map(field => field.name).should.deep.equal(['customerName', 'amount']));
    it('should save and reload hierarchical destination metadata', () => (navigation.properties.items[0].values.destination as Record<string, unknown>).should.deep.equal({ screen: 'Orders', route: '/orders/:id', slot: 'details', dialog: 'OrderDialog' }));
    it('should save and reload template slot configuration', () => reloaded.document.screenTemplates[0].slots.map(slot => `${slot.name}:${slot.description ?? ''}:${slot.routed ?? false}:${slot.role ?? ''}`).should.deep.equal(['content::false:', 'details:Side panel:true:', 'dialog:Dialog host:false:panel']));
    it('should save and reload dialog template configuration', () => reloaded.document.dialogTemplates[0].should.deep.include({ name: 'OrderDialog', displayName: 'Order details', description: 'Shows order details' }));
    it('should save and reload application composition exports', () => reloaded.document.exposures.map(exposure => `${exposure.owner}:${exposure.properties[0].path}`).should.deep.equal(['Shell:items']));
    it('should save and reload application toolbar contributions', () => reloaded.document.instanceContributions.map(contribution => `${contribution.instance}:${contribution.path}:${contribution.items?.[0].id}`).should.deep.equal(['screen:Screen:items:global-orders']));
});


describe('when dialog template authoring is undone and redone through the editor session', () => {
    const base = documentWithNavigation();
    const added = changeDocumentInSession(openSession(base), { ...base, dialogTemplates: [{ name: 'OrderDialog', slots: [{ name: 'content' }], behaviors: [] }] }, 'Add dialog template');
    const undone = undo(added);
    const redone = redo(undone);

    it('should mark the dialog template edit dirty', () => added.isDirty.should.be.true);
    it('should remove the template when the edit is undone', () => undone.document.dialogTemplates.should.deep.equal([]));
    it('should restore the template when the edit is redone', () => redone.document.dialogTemplates.map(template => template.name).should.deep.equal(['OrderDialog']));
});

describe('when a navigation destination is edited through the editor session', () => {
    const base = documentWithNavigation();
    const root = (base.screens[0].slotContent.content[0] as unknown) as RootElement;
    const updatedRoot: RootElement = {
        ...root,
        children: root.children.map(child => child.id === 'nav' ? {
            ...child,
            properties: {
                ...child.properties,
                items: child.properties.items.map(item => item.id === 'orders' ? { ...item, values: { ...item.values, destination: { screen: 'Invoices', route: '/orders/:id', slot: 'details', dialog: 'OrderDialog' } } } : item),
            },
        } : child),
    };
    const session = changeDocumentInSession(openSession(base), { ...base, screens: [{ ...base.screens[0], slotContent: { content: [updatedRoot as never] } }] }, 'Change destination');
    const navigation = navigationOf(session.document);

    it('should accept the destination edit', () => session.diagnostics.should.deep.equal([]));
    it('should update the destination screen', () => (navigation.properties.items[0].values.destination as { screen: string }).screen.should.equal('Invoices'));
    it('should keep route slot and dialog metadata', () => (navigation.properties.items[0].values.destination as Record<string, unknown>).should.deep.equal({ screen: 'Invoices', route: '/orders/:id', slot: 'details', dialog: 'OrderDialog' }));
});
