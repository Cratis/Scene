// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, Screen, ScreenTemplate } from '@cratis/scene.model';
import { isDialogScreen, onNeutralSurface, presentsCommand, withoutFormSubmits } from '../sliceSurface';

const component = (id: string, componentName: string, properties: Record<string, unknown>, slots: Record<string, ExternalComponent[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

const screen = (overrides: Partial<Screen> = {}): Screen => ({ name: 'S', layout: 'AppShell', slotContent: {}, forms: [], contributions: [], ...overrides });
const form = (forCommand: string) => ({ name: `${forCommand}Form`, forCommand, fields: [], behaviors: [] });

describe('when describing what a slice presents', () => {
    describe('and a screen hosts a form for the command', () => {
        it('should present the command', () => presentsCommand([screen({ forms: [form('Add')] })], 'Add').should.equal(true));
    });

    describe('and a screen has an action nested in a slot that executes the command', () => {
        const nested = screen({ slotContent: { content: [component('panel', 'x:panel', {}, { body: [component('a', 'core:action', { command: 'Add' })] })] } });

        it('should present the command', () => presentsCommand([nested], 'Add').should.equal(true));
        it('should not present another command', () => presentsCommand([nested], 'Remove').should.equal(false));
    });

    describe('and a screen places a command form for the command', () => {
        it('should present the command', () => presentsCommand([screen({ slotContent: { content: [component('f', 'Cratis.Components.commandForm', { command: 'Add' })] } })], 'Add').should.equal(true));
    });

    describe('and a screen has nothing to do with the command', () => {
        it('should not present the command', () => presentsCommand([screen({ slotContent: { content: [component('t', 'x:text', { text: 'Add' })] } })], 'Add').should.equal(false));
    });

    describe('and the screen has an action that is the submit of a form it hosts', () => {
        const result = withoutFormSubmits(screen({
            forms: [form('Add')],
            slotContent: { actions: [component('a', 'core:action', { command: 'Add', label: 'Put in basket' }), component('b', 'core:action', { command: 'Remove', label: 'Remove' })] },
        }));

        it('should leave that action out and keep the others', () => result.screen.slotContent.actions.map(element => element.id).should.deep.equal(['b']));
        it('should remember its label by the command', () => result.labels.should.deep.equal({ Add: 'Put in basket' }));
    });

    describe('and the action is nested in a slot of another element', () => {
        const result = withoutFormSubmits(screen({
            forms: [form('Add')],
            slotContent: { content: [component('panel', 'x:panel', {}, { footer: [component('a', 'core:action', { command: 'Add' })] })] },
        }));

        it('should leave it out of that slot too, with no label to remember', () => [(result.screen.slotContent.content[0] as ExternalComponent).slots.footer.length, result.labels].should.deep.equal([0, {}]));
    });

    describe('and the screen hosts no form', () => {
        const original = screen({ slotContent: { actions: [component('a', 'core:action', { command: 'Add' })] } });

        it('should keep the screen as it is', () => withoutFormSubmits(original).screen.should.equal(original));
    });

    describe('and asking whether a screen is a dialog', () => {
        const templates = [{ name: 'Quick', slots: [], metadata: { type: 'Dialog' } }, { name: 'List', slots: [], metadata: { type: 'Screen' } }] as unknown as ScreenTemplate[];

        it('should say so when its template is a dialog template', () => isDialogScreen(screen({ screenTemplate: 'Quick' }), templates).should.equal(true));
        it('should not when its template is another type', () => isDialogScreen(screen({ screenTemplate: 'List' }), templates).should.equal(false));
        it('should not when it names no template', () => isDialogScreen(screen(), templates).should.equal(false));
    });

    describe('and putting a screen on the neutral surface', () => {
        it('should move it to the chrome-less layout and leave the rest as it is', () => [onNeutralSurface(screen()).layout, onNeutralSurface(screen()).name].should.deep.equal(['FullPage', 'S']));
    });
});
