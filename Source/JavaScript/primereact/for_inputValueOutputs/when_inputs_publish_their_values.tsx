// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { BindingMode } from '@cratis/scene.model';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { primeReactDescriptors } from '../primeReactDescriptors';
import { sceneComponent, scenePanel } from '../storyElements';

const inputs = ['inputText', 'inputTextarea', 'password', 'inputNumber', 'calendar', 'dropdown', 'multiSelect', 'radioButton', 'checkbox', 'toggleSwitch'];

function renderInputs(onOutputs: (outputs: Record<string, Record<string, unknown>>) => void) {
    return render(<PrimeReactProvider>
        <SceneElementView registry={primeReactComponents} onComponentOutputsChanged={onOutputs} element={scenePanel('form', [
            sceneComponent('name', 'inputText', { ariaLabel: 'Name', value: 'Draft' }),
            sceneComponent('notes', 'inputTextarea', { ariaLabel: 'Notes' }),
            sceneComponent('budget', 'inputNumber', { ariaLabel: 'Budget', value: 1200 }),
            sceneComponent('due', 'calendar', { ariaLabel: 'Due', value: '2026-10-10T00:00:00.000Z' }),
            sceneComponent('category', 'dropdown', { ariaLabel: 'Category', value: 'b', options: ['a', 'b'] }),
            sceneComponent('tags', 'multiSelect', { ariaLabel: 'Tags', value: ['x'], options: ['x', 'y'] }),
            sceneComponent('notify', 'checkbox', { ariaLabel: 'Notify me', checked: true }),
            sceneComponent('active', 'toggleSwitch', { ariaLabel: 'Active' }),
        ])} />
    </PrimeReactProvider>);
}

describe('when PrimeReact inputs publish their values', () => {
    let latest: Record<string, Record<string, unknown>>;
    beforeEach(() => {
        latest = {};
        renderInputs(outputs => (latest = outputs));
    });
    afterEach(cleanup);

    it('should declare a one-way value output for every input', () =>
        inputs.map(name => primeReactDescriptors.find(descriptor => descriptor.component === `PrimeReact:${name}`)?.properties.find(property => property.path === 'value'))
            .every(property => property?.output === true && property.readOnly === true && property.bindingMode === BindingMode.OneWay).should.equal(true));

    it('should publish each initial value on mount, as JSON', () =>
        Object.fromEntries(Object.entries(latest).map(([id, outputs]) => [id, outputs.value])).should.deep.equal({
            name: 'Draft', notes: '', budget: 1200, due: '2026-10-10T00:00:00.000Z', category: 'b', tags: ['x'], notify: true, active: false,
        }));

    it('should publish what the user types', () => {
        fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Atlas' } });
        fireEvent.change(screen.getByRole('textbox', { name: 'Notes' }), { target: { value: 'Kick-off on Monday' } });
        latest.name.value!.should.equal('Atlas');
        latest.notes.value!.should.equal('Kick-off on Monday');
    });

    it('should publish a toggled checkbox', () => {
        fireEvent.click(screen.getByRole('checkbox', { name: 'Notify me' }));
        latest.notify.value!.should.equal(false);
    });
});
