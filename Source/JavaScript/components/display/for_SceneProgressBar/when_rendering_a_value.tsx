// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { SceneElementView } from '@cratis/scene.react';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';

const renderBar = (properties: Record<string, unknown>) => {
    render(<SceneElementView element={externalComponent('Cratis.Components:progressBar', properties)} registry={cratisComponents} resolveBinding={() => undefined} />);
    return screen.getByRole('progressbar');
};

describe('when rendering a progress bar', () => {
    afterEach(cleanup);

    it('should be determinate at the given value', () => renderBar({ value: 68 }).getAttribute('aria-valuenow')!.should.equal('68'));
    it('should show the value as a percentage', () => renderBar({ value: 68 }).textContent!.should.equal('68%'));
    it('should hide the percentage when told to', () => renderBar({ value: 68, showValue: false }).textContent!.should.equal(''));
    it('should name the bar after its label', () => renderBar({ value: 68, label: 'Warehouse capacity' }).getAttribute('aria-label')!.should.equal('Warehouse capacity'));
    it('should be named Progress when it has no label', () => renderBar({ value: 68 }).getAttribute('aria-label')!.should.equal('Progress'));
    it('should be indeterminate without a value', () => {
        const bar = renderBar({});
        bar.getAttribute('data-mode')!.should.equal('indeterminate');
        bar.hasAttribute('aria-valuenow').should.equal(false);
    });
});
