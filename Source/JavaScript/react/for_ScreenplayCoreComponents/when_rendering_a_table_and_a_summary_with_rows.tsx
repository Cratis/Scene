// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'chai';
import { render, screen } from '@testing-library/react';
import { Control, ExternalComponent, HorizontalAlignment, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { SceneElementView } from '../SceneElementView';
import { coreComponents } from '../core';

const control = (id: string): Control => ({
    id, name: id, properties: {}, visibility: Visibility.Visible, isEnabled: true, opacity: 1, size: {}, zIndex: 0, minimumSize: {}, maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 }, horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch,
    borderThickness: { left: 0, top: 0, right: 0, bottom: 0 }, padding: { left: 0, top: 0, right: 0, bottom: 0 }, tabIndex: 0,
});

const component = (id: string, componentName: string, properties: Record<string, unknown> = {}, slots: Record<string, ExternalComponent[]> = {}): ExternalComponent =>
    ({ ...control(id), componentName, properties, slots });

const table = component('orders', 'core:table', { typeName: 'Order' }, { columns: [
    component('c1', 'core:column', { property: 'number', label: 'Order' }),
    component('c2', 'core:column', { property: 'status', label: 'Status' }),
] });
const summary = component('summary', 'core:summary', { typeName: 'Order' }, { fields: [component('f1', 'core:field', { property: 'number', label: 'Order' })] });
const rows = { Order: [{ number: 'A-1', status: 'Open' }, { number: 'A-2', status: 'Shipped' }] };

describe('when rendering a Screenplay table and summary the host supplied rows for', () => {
    beforeEach(() => {
        render(<>
            <SceneElementView element={table} registry={coreComponents} resolveBinding={() => undefined} queryResults={rows} />
            <SceneElementView element={summary} registry={coreComponents} resolveBinding={() => undefined} queryResults={rows} />
        </>);
    });

    it('should render the column headings', () => expect(screen.getAllByRole('columnheader').map(heading => heading.textContent)).to.deep.equal(['Order', 'Status']));
    it('should render a row for each row supplied', () => expect(screen.getAllByRole('row')).to.have.length(3));
    it('should render the values of the columns', () => expect(screen.getAllByRole('cell').map(cell => cell.textContent)).to.deep.equal(['A-1', 'Open', 'A-2', 'Shipped']));
    it('should render the summary value of the first row', () => expect(screen.getByText('A-1', { selector: 'dd' })).to.exist);
});

describe('when rendering a Screenplay table the host supplied no rows for', () => {
    beforeEach(() => { render(<SceneElementView element={table} registry={coreComponents} resolveBinding={() => undefined} />); });

    it('should render only the headings', () => expect(screen.getAllByRole('row')).to.have.length(1));
});
