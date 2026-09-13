// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { fireEvent, render, screen } from '@testing-library/react';
import { Control, ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { SceneElementView } from '../SceneElementView';
import { coreComponents } from '../core';

function control(id: string): Control {
    return {
        id,
        name: id,
        properties: {},
        visibility: Visibility.Visible,
        isEnabled: true,
        opacity: 1,
        size: {},
        zIndex: 0,
        minimumSize: {},
        maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch,
        verticalAlignment: VerticalAlignment.Stretch,
        borderThickness: { left: 0, top: 0, right: 0, bottom: 0 },
        padding: { left: 0, top: 0, right: 0, bottom: 0 },
        tabIndex: 0,
    };
}

const component = (
    id: string,
    componentName: string,
    properties: Record<string, unknown> = {},
    slots: Record<string, ExternalComponent[]> = {},
): ExternalComponent => ({ ...control(id), componentName, properties, slots });

describe('when rendering a translated Screenplay screen', () => {
    const title = component('title', 'core:title', { text: 'Invoices' });
    const action = component('create', 'core:action', { command: 'CreateInvoice', label: 'Create invoice' });
    const section = component('section', 'core:section', { name: 'Open invoices' }, { content: [title, action] });

    beforeEach(() => {
        render(<SceneElementView element={section} registry={coreComponents} resolveBinding={() => undefined} />);
    });

    it('should render the section heading', () => expect(screen.getByRole('heading', { name: 'Open invoices' })).to.exist);
    it('should render the translated title', () => expect(screen.getByRole('heading', { name: 'Invoices' })).to.exist);
    it('should render the modeled action', () => expect(screen.getByRole('button', { name: 'Create invoice' })).to.exist);

    it('should announce the modeled command to the host', () => {
        let command = '';
        const listener = (event: Event) => { command = (event as CustomEvent).detail.command; };
        globalThis.addEventListener('cratis.scene.command', listener, { once: true });

        fireEvent.click(screen.getByRole('button', { name: 'Create invoice' }));

        command.should.equal('CreateInvoice');
    });
});
