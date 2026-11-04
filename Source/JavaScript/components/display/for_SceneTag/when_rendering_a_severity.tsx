// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { SceneElementView } from '@cratis/scene.react';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';

const renderTag = (properties: Record<string, unknown>) => {
    render(<SceneElementView element={externalComponent('Cratis.Components:tag', properties)} registry={cratisComponents} resolveBinding={() => undefined} />);
    return screen.getByText(String(properties.value)).closest('[data-cratis-part="root"]')!;
};

describe('when rendering a tag with a severity', () => {
    afterEach(cleanup);

    it('should show the value', () => renderTag({ value: 'Shipped', severity: 'success' }).textContent!.should.equal('Shipped'));
    it('should keep a severity the library knows', () => renderTag({ value: 'Shipped', severity: 'success' }).getAttribute('data-severity')!.should.equal('success'));
    it('should translate the PrimeReact warning severity to warn', () => renderTag({ value: 'Overdue', severity: 'warning' }).getAttribute('data-severity')!.should.equal('warn'));
    it('should translate error to danger', () => renderTag({ value: '500', severity: 'error' }).getAttribute('data-severity')!.should.equal('danger'));
    it('should fall back to the default severity for one it does not know', () => renderTag({ value: 'Beta', severity: 'help' }).getAttribute('data-severity')!.should.equal('secondary'));
    it('should round the tag when asked to', () => renderTag({ value: 'New', rounded: true }).hasAttribute('data-rounded').should.equal(true));
});
