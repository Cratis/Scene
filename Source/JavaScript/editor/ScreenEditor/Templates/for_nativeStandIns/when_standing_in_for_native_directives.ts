// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { formStandIns, nativeStandIns } from '../nativeStandIns';

const table = `table OrderRow
  column orderId label "Order"
  column status label "Status"
  on double click
    navigate to OrderPage
      with orderId from item.orderId`;

const toolbar = `toolbar basketActions
  button checkout title "Check out" slice Shop.Checkout.CheckOut emphasis primary icon shopping-cart
    authorize IsShopper
  button clear title "Clear" slice Shop.Basket.Clear emphasis secondary`;

type Drawn = { id: string; componentName: string; properties: Record<string, unknown>; slots: Record<string, Drawn[]> };
const drawn = (entries: { at?: number; text?: string }[]) => nativeStandIns(entries, 'list') as unknown as Drawn[];

describe('when a screen keeps a table with a row action natively', () => {
    const [element] = drawn([{ at: 1, text: table }]);

    it('should draw it as a table of the read model', () => { element.componentName.should.equal('core:table'); (element.properties.typeName as string).should.equal('OrderRow'); });
    it('should carry the columns the screen says, with their labels', () => element.slots.columns.map(column => column.properties.label).should.deep.equal(['Order', 'Status']));
    it('should keep its id apart from other slots', () => element.id.should.equal('native-list-0-0'));
});

describe('when a screen keeps a toolbar natively', () => {
    const [element] = drawn([{ at: 0, text: toolbar }]);

    it('should draw it as an outlet of actions, as Scene draws a toolbar', () => { element.componentName.should.equal('core:outletItems'); (element.properties.kind as string).should.equal('actions'); });
    it('should carry each button with its title', () => (element.properties.items as { title: string }[]).map(item => item.title).should.deep.equal(['Check out', 'Clear']));
    it('should carry the emphasis the screen gives each button', () => (element.properties.items as { emphasis: string }[]).map(item => item.emphasis).should.deep.equal(['primary', 'secondary']));
    it('should carry the slice each button opens', () => (element.properties.items as { slice: string }[]).map(item => item.slice).should.deep.equal(['Shop.Checkout.CheckOut', 'Shop.Basket.Clear']));
});

describe('when a list screen keeps an action on the selected row natively', () => {
    const [element] = drawn([{ at: 0, text: `action "Approve for sale"
  when item.status == "draft" execute ApproveProductForSale` }]);

    it('should draw it as a toolbar button with its title', () => { element.componentName.should.equal('core:outletItems'); (element.properties.items as { title: string }[])[0].title.should.equal('Approve for sale'); });
});

describe('when a screen keeps something the stand-ins do not know natively', () => {
    const [element] = drawn([{ at: 0, text: 'form NewProduct' }]);

    it('should still say it, in the words the screen says it in', () => { element.componentName.should.equal('core:text'); (element.properties.text as string).should.equal('form NewProduct'); });
});

describe('when a screen keeps nothing natively', () => {
    it('should draw nothing', () => nativeStandIns(undefined, 'content').should.be.empty);
    it('should ignore an entry without text', () => nativeStandIns([{ at: 0 }], 'content').should.be.empty);
});

describe('when a screen keeps the form of a command its action opens', () => {
    const forms = [{ name: 'DraftProductForm', forCommand: 'DraftProduct', fields: [{ name: 'sku', label: 'SKU' }, { name: 'name', label: 'Product' }] }];
    const [form] = formStandIns(forms) as unknown as { id: string; children: { componentName: string; properties: Record<string, unknown> }[] }[];

    it('should draw the form with its title, its fields as a summary of labels and the button that sends the command', () =>
        form.children.map(child => child.componentName).should.deep.equal(['core:text', 'core:summary', 'button']));
    it('should label the fields as the form does', () => (form.children[1] as unknown as { slots: { fields: { properties: { label: string } }[] } }).slots.fields.map(field => field.properties.label).should.deep.equal(['SKU', 'Product']));
    it('should read the command as words', () => (form.children[2].properties.label as string).should.equal('Draft Product'));
    it('should not draw a form again whose command a form element on the canvas already stands for', () => formStandIns(forms, new Set(['DraftProduct'])).should.be.empty);
    it('should draw a form without fields as its title and its button', () =>
        (formStandIns([{ forCommand: 'ApproveProductForSale', fields: [] }]) as unknown as { children: { componentName: string }[] }[])[0].children.map(child => child.componentName).should.deep.equal(['core:text', 'button']));
    it('should draw nothing for a screen without forms', () => formStandIns(undefined).should.be.empty);
    it('should leave the title to the dialog\'s frame and sending to its button row in a dialog', () =>
        (formStandIns(forms, new Set(), true) as unknown as { children: { componentName: string }[] }[])[0].children.map(child => child.componentName).should.deep.equal(['core:summary']));
});

describe('when a toolbar is followed by actions on the selected row', () => {
    const drawn = nativeStandIns([
        { at: 0, text: 'toolbar actions\n  button new title "New product" slice Shop.Products.Draft emphasis primary' },
        { at: 1, text: 'action "Approve for sale"\n  when item.status == "draft" execute Approve' },
        { at: 1, text: 'action "Withdraw"\n  when item.status == "approved" execute Withdraw' },
    ], 'toolbar') as unknown as { componentName: string; properties: { items: { title: string }[] } }[];

    it('should draw them as one toolbar', () => drawn.length.should.equal(1));
    it('should draw every button in the order the screen states them', () => drawn[0].properties.items.map(item => item.title).should.deep.equal(['New product', 'Approve for sale', 'Withdraw']));
});
