// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { Screen, ScreenTemplate } from '@cratis/scene.model';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ApplicationDocument } from '../ApplicationDocument';
import { element, ordersApplication, registry } from './given';
import { preview } from './when_previewing_a_module';

function Action({ element: action }: RegisteredComponentProps) {
    return <button type='button' data-action={String(action.properties.command)}>{String(action.properties.label ?? 'Action')}</button>;
}

function CommandForm({ element: form }: RegisteredComponentProps) {
    return <form data-command-form={String(form.properties.command)}><input name='customer' /><button type='submit'>{String(form.properties.submitLabel ?? 'Submit')}</button></form>;
}

const quickCreate: ScreenTemplate = {
    name: 'QuickCreate',
    slots: [{ name: 'body' }, { name: 'actions' }, { name: 'forms' }],
    content: {},
    metadata: { type: 'Dialog', category: 'Foundation / Dialog' } as ScreenTemplate['metadata'],
};

const screenOf = (name: string, owner: string, overrides: Partial<Screen> = {}): Screen => ({ name, layout: 'AppShell', slotContent: {}, forms: [], contributions: [], owner, ...overrides });

/** A slice the way the Screenplay authors it: a dialog template screen with an action that executes the command, and the form of the command on the screen. */
function applicationOf(placeOrder: Screen): ApplicationDocument {
    const base = ordersApplication();
    return { ...base, screenTemplates: [quickCreate], screens: [...base.screens, placeOrder] };
}

const dialogScreen = () => screenOf('PlaceOrderDialog', 'sales.orders.PlaceOrder', {
    screenTemplate: 'QuickCreate',
    slotContent: { actions: [element('place', 'core:action', { command: 'PlaceOrder', label: 'Place it' })] },
    forms: [{ name: 'PlaceOrderForm', forCommand: 'PlaceOrder', fields: [], behaviors: [] }],
});

const previewOf = (placeOrder: Screen) => preview({
    document: applicationOf(placeOrder),
    target: { slice: 'sales.orders.PlaceOrder' },
    registry: { ...registry, 'core:action': Action, 'test:form': CommandForm },
    composition: { form: (name, form) => element(`form-${name}-${form.name}`, 'test:form', { command: form.forCommand }) },
});

const surface = () => document.querySelector('.scene-preview-host')!.getAttribute('data-scene-preview-surface');

describe('when previewing a slice on a neutral surface', () => {
    afterEach(cleanup);

    describe('and the slice owns a dialog template screen with an action and the form of its command', () => {
        beforeEach(() => { render(previewOf(dialogScreen())); });

        it('should draw it as an opened dialog on a neutral backdrop', () => surface()!.should.equal('dialog'));
        it('should draw no application chrome around it', () => [document.querySelector('.layout-topbar'), document.querySelector('.layout-sidebar'), document.querySelector('nav'), document.querySelector('[data-page]')].should.deep.equal([null, null, null, null]));
        it('should present the command once: one form', () => document.querySelectorAll('[data-command-form="PlaceOrder"]').length.should.equal(1));
        it('should leave the action out, because it is the submit of that form', () => document.querySelectorAll('[data-action="PlaceOrder"]').length.should.equal(0));
        it('should give the one submit button the label of the action', () => Array.from(document.querySelectorAll('button')).map(button => button.textContent).should.deep.equal(['Place it']));
        it('should not open the task dialog on top of it', () => (screen.queryByRole('dialog') === null).should.equal(true));
    });

    describe('and the slice owns a page screen that hosts the form of its command', () => {
        beforeEach(() => { render(previewOf(screenOf('PlaceOrderPage', 'sales.orders.PlaceOrder', { forms: [{ name: 'PlaceOrderForm', forCommand: 'PlaceOrder', fields: [], behaviors: [] }] }))); });

        it('should draw it inline on a neutral page', () => surface()!.should.equal('page'));
        it('should present the command once, without the task dialog', () => [document.querySelectorAll('[data-command-form="PlaceOrder"]').length, screen.queryByRole('dialog')].should.deep.equal([1, null]));
        it('should draw no application chrome around it', () => [document.querySelector('.layout-topbar'), document.querySelector('nav')].should.deep.equal([null, null]));
    });

    describe('and the slice owns a screen that does not present its command', () => {
        beforeEach(() => { render(previewOf(screenOf('PlaceOrderPage', 'sales.orders.PlaceOrder', { slotContent: { content: [element('place-order-page', 'test:page', { title: 'Place order' })] } }))); });

        it('should open the task dialog, so the command is presented once', () => [surface(), screen.getAllByRole('dialog').length].should.deep.equal(['task-dialog', 1]));
        it('should still draw what the slice owns', () => (document.querySelector('[data-page="place-order-page"]') !== null).should.equal(true));
    });

    describe('and the screen is on the application shell that names a root template', () => {
        beforeEach(() => { render(previewOf(dialogScreen())); });

        it('should be on the chrome-less layout', () => (document.querySelector('.layout-full-page') !== null).should.equal(true));
    });
});
