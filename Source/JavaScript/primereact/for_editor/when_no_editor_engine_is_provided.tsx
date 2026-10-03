// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { PrimeEditor } from '../editor/PrimeEditor';
import { sceneComponent } from '../storyElements';
import { forbiddenInOutput, hostileHtml } from './given/hostile_html';

describe('when no editor engine is provided', () => {
    const properties = { value: hostileHtml, readOnly: false, ariaLabel: 'Release notes' };
    const element = sceneComponent('editor', 'editor', properties);
    const before = JSON.stringify(element.properties);
    let container: HTMLElement;

    beforeEach(() => {
        (window as unknown as { __xss?: number }).__xss = undefined;
        container = render(<PrimeEditor element={element} slots={{}} />).container;
    });

    it('should show the content read-only, as safe elements', () => {
        const view = screen.getByRole('textbox', { name: 'Release notes' });
        view.getAttribute('aria-readonly')!.should.equal('true');
        view.textContent!.should.contain('hi');
        view.textContent!.should.contain('styled');
    });

    for (const forbidden of forbiddenInOutput) {
        it(`should put nothing containing '${forbidden.replace('\t', '<tab>')}' into the document`, () => {
            container.innerHTML.toLowerCase().should.not.contain(forbidden.toLowerCase());
        });
    }

    it('should have no element that can run or load anything', () => {
        Array.from(container.querySelectorAll('script, style, iframe, svg, form, img[src^="http"], [onerror], [onclick], [onload], [style]')).map(node => node.outerHTML).should.deep.equal([]);
        Array.from(container.querySelectorAll('a')).every(link => link.getAttribute('href') === null || /^(https?:|mailto:|tel:|\/|#)/.test(link.getAttribute('href')!)).should.equal(true);
        ((window as unknown as { __xss?: number }).__xss === undefined).should.equal(true);
    });

    it('should say why it is not editable', () => {
        screen.getByRole('status').textContent!.should.contain('not available');
    });

    it('should leave the authored value exactly as it was', () => {
        JSON.stringify(element.properties).should.equal(before);
    });

    it('should not claim to be editable', () => {
        (container.querySelector('[contenteditable="true"]') === null).should.equal(true);
    });
});
