// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { styles as buttonStyles } from '@primereact/styles/button';
import { PrimeButton } from '../button/PrimeButton';
import { sceneComponent } from '../storyElements';

// The class names are the ones PrimeReact's own styles give a button, and the ones primeReactTheme.css paints from the design system.
const classesOf = (properties: Record<string, unknown>): string[] => {
    const { container, unmount } = render(
        <PrimeReactProvider defaults={{ Button: { props: { styles: buttonStyles } } }}>
            <PrimeButton element={sceneComponent('button', 'button', { label: 'Save', ...properties })} slots={{}} interactions={{}} />
        </PrimeReactProvider>);
    const classes = Array.from(container.querySelector('button')!.classList).filter(name => name !== 'p-button' && name !== 'p-component');
    unmount();
    return classes;
};

describe('when rendering a button', () => {
    it('should draw PrimeReact\'s default look when no variant is chosen', () => classesOf({}).should.deep.equal([]));
    it('should draw PrimeReact\'s default look for the primary variant', () => classesOf({ severity: 'primary' }).should.deep.equal([]));

    for (const severity of ['secondary', 'success', 'info', 'warn', 'danger', 'help', 'contrast']) {
        it(`should draw the ${severity} variant as PrimeReact's ${severity} severity`, () => classesOf({ severity }).should.deep.equal([`p-button-${severity}`]));
    }

    for (const form of ['outlined', 'text', 'link']) {
        it(`should draw the ${form} variant as PrimeReact's ${form} form`, () => classesOf({ severity: form }).should.deep.equal([`p-button-${form}`]));
    }

    it('should combine a severity with a form chosen by flag', () => classesOf({ severity: 'danger', outlined: true }).should.have.members(['p-button-danger', 'p-button-outlined']));
});
