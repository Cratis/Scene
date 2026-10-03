// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { PrimeMultiStateCheckbox } from '../form/PrimeMultiStateCheckbox';
import { sceneComponent } from '../storyElements';

const reference = { library: '@fortawesome/free-solid', key: 'check', variant: 'solid' };

function renderCheckbox(properties: Record<string, unknown>) {
    render(<PrimeMultiStateCheckbox element={sceneComponent('review', 'multiStateCheckbox', properties)} slots={{}} />);
    return screen.getByRole('button');
}

function glyph(button: HTMLElement): HTMLElement {
    return button.querySelector('[data-scene-part="glyph"]')!;
}

describe('when drawing the glyph of a multi-state checkbox', () => {
    it('should theme the empty box with the PrimeReact checkbox tokens', () => {
        const style = glyph(renderCheckbox({ options: ['A'] })).getAttribute('style')!;
        ['--p-checkbox-width', '--p-checkbox-height', '--p-checkbox-border-radius', '--p-checkbox-border-color', '--p-checkbox-background']
            .filter(token => !style.includes(token)).should.deep.equal([]);
    });

    it('should theme a chosen state with the PrimeReact checked tokens', () => {
        const button = renderCheckbox({ options: ['A'] });
        fireEvent.click(button);
        const style = glyph(button).getAttribute('style')!;
        ['--p-checkbox-checked-border-color', '--p-checkbox-checked-background', '--p-checkbox-icon-checked-color']
            .filter(token => !style.includes(token)).should.deep.equal([]);
    });

    it('should draw an empty box for the empty state and a mark for a state without an icon', () => {
        const button = renderCheckbox({ options: ['A'] });
        const empty = glyph(button).childElementCount;
        fireEvent.click(button);
        [empty, glyph(button).querySelector('svg') !== null].should.deep.equal([0, true]);
    });

    it('should draw a PrimeIcons class name as before', () => {
        const button = renderCheckbox({ options: [{ label: 'A', value: 'a', icon: 'pi pi-check' }] });
        fireEvent.click(button);
        (glyph(button).querySelector('i.pi.pi-check') !== null).should.equal(true);
    });

    it('should draw a qualified icon reference through the Scene icon system', () => {
        const button = renderCheckbox({ options: [{ label: 'A', value: 'a', icon: reference }] });
        fireEvent.click(button);
        const icon = glyph(button).querySelector('[data-icon-library]') as HTMLElement;
        [icon.dataset.iconLibrary, icon.dataset.iconKey, icon.dataset.iconVariant].should.deep.equal(['@fortawesome/free-solid', 'check', 'solid']);
    });

    it('should draw the empty state icon when one is authored', () => {
        const button = renderCheckbox({ options: ['A'], emptyIcon: reference });
        (glyph(button).querySelector('[data-icon-key="check"]') !== null).should.equal(true);
    });
});
