// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { SceneElementView } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, scenePanel } from '../storyElements';

describe('when naming form controls', () => {
    beforeEach(() => {
        render(<PrimeReactProvider>
            <SceneElementView registry={primeReactComponents} element={scenePanel('form', [
                sceneComponent('name', 'inputText', { ariaLabel: 'Name' }),
                sceneComponent('notes', 'inputTextarea', { ariaLabel: 'Notes' }),
                sceneComponent('secret', 'password', { ariaLabel: 'Password' }),
                sceneComponent('price', 'inputNumber', { ariaLabel: 'Price' }),
                sceneComponent('available', 'calendar', { ariaLabel: 'Available from' }),
                sceneComponent('category', 'dropdown', { ariaLabel: 'Category', options: ['A', 'B'] }),
                sceneComponent('notify', 'checkbox', { ariaLabel: 'Notify me' }),
            ])} />
        </PrimeReactProvider>);
    });

    it('should give every text field its accessible name', () =>
        ['Name', 'Notes'].forEach(name => Boolean(screen.getByRole('textbox', { name })).should.equal(true)));

    it('should name the number field', () => Boolean(screen.getByRole('spinbutton', { name: 'Price' })).should.equal(true));
    it('should name the date field', () => Boolean(screen.getByRole('combobox', { name: 'Available from' })).should.equal(true));

    it('should name the password field', () => Boolean(screen.getByLabelText('Password')).should.equal(true));
    it('should name the dropdown trigger', () => Boolean(screen.getByLabelText('Category')).should.equal(true));
    it('should name a checkbox that has no visible label', () => Boolean(screen.getByLabelText('Notify me')).should.equal(true));
});
