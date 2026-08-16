// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render, screen } from '@testing-library/react';
import { ExternalComponent } from '@cratis/scene.model';
import { SceneElementView } from '@cratis/scene.react';
import { externalComponent } from '../given';
import { cratisComponents } from '../cratisComponents';
import { clearBindings } from '../bindings';

function withContent(element: ExternalComponent, content: ExternalComponent[]): ExternalComponent {
    return { ...element, slots: { content } };
}

const heading = withContent(externalComponent('Cratis.Components:page', { title: 'Invoices', showTitle: true }), [
    externalComponent('Cratis.Components:toolbar', {}),
    externalComponent('Cratis.Components:dataTable', { query: 'AllInvoices', emptyMessage: 'No invoices' }),
]);

describe('when rendering a screen through the real renderer', () => {
    beforeEach(() => {
        clearBindings();
        render(<SceneElementView element={heading} registry={cratisComponents} resolveBinding={() => undefined} />);
    });

    afterEach(() => clearBindings());

    it('should resolve every component name against this package registry', () => screen.getByRole('heading', { name: 'Invoices' }).should.exist);

    it('should render the unbound table as a placeholder without taking the rest of the screen with it', () => {
        screen.getByText("Unresolved query binding 'AllInvoices' on Cratis.Components:dataTable").should.exist;
        screen.getByRole('heading', { name: 'Invoices' }).should.exist;
    });

    it('should render no unresolved-component fallback', () =>
        (document.querySelector('[data-scene-unresolved-component]') === null).should.be.true);
});
