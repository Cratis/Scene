// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { SceneElementView } from '@cratis/scene.react';
import { cratisComponents } from '../../cratisComponents';
import { externalComponent } from '../../given';

const renderMessage = (properties: Record<string, unknown>) => {
    render(<SceneElementView element={externalComponent('Cratis.Components:message', properties)} registry={cratisComponents} resolveBinding={() => undefined} />);
    return screen.getByText(String(properties.text)).closest('[data-cratis-part="root"]')!;
};

describe('when rendering a message', () => {
    afterEach(cleanup);

    it('should show the text', () => renderMessage({ text: 'Saved', severity: 'success' }).textContent!.should.contain('Saved'));
    it('should announce a non-error message as a status', () => renderMessage({ text: 'Saved', severity: 'success' }).getAttribute('role')!.should.equal('status'));
    it('should announce an error as an alert', () => renderMessage({ text: 'Failed', severity: 'error' }).getAttribute('role')!.should.equal('alert'));
    it('should default to info', () => renderMessage({ text: 'FYI' }).getAttribute('data-severity')!.should.equal('info'));
    it('should translate the PrimeReact warning severity to warn', () => renderMessage({ text: 'Careful', severity: 'warning' }).getAttribute('data-severity')!.should.equal('warn'));
    it('should translate danger to error', () => renderMessage({ text: 'Failed', severity: 'danger' }).getAttribute('data-severity')!.should.equal('error'));
    it('should fall back to info for a severity it does not know', () => renderMessage({ text: 'Odd', severity: 'help' }).getAttribute('data-severity')!.should.equal('info'));
});
