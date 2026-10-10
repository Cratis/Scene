// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { BindingSourceKind, ExternalComponent } from '@cratis/scene.model';
import { RegisteredComponentProps } from '../renderer';
import { SceneElementView } from '../SceneElementView';

const binding = (properties: Record<string, unknown>) => properties;
const element = (id: string, componentName: string, properties: Record<string, unknown> = {}) =>
    ({ id, componentName, properties, slots: {} }) as unknown as ExternalComponent;

function Table({ bindingOutputs }: RegisteredComponentProps) {
    return <button type='button' onClick={() => bindingOutputs?.setOutput('selectedItem', { id: 'INV-2', total: 120 })}>Select</button>;
}

function Value({ element: { id, properties } }: RegisteredComponentProps) {
    return <span data-testid={id}>{JSON.stringify(properties.value ?? 'absent')}</span>;
}

/** A detail region: renders its own Scene tree with the selected row as its data context. */
function Detail({ element: { properties } }: RegisteredComponentProps) {
    return <SceneElementView registry={registry} dataContext={properties.row}
        element={{ id: 'detail-panel', children: [
            element('detail-total', 'test:value', { value: binding({ path: 'total' }) }),
            element('detail-customer', 'test:value', { value: binding({ path: 'customer' }) }),
            element('detail-query', 'test:value', { value: binding({ kind: BindingSourceKind.QueryResult, query: 'customers', path: '0' }) }),
            element('detail-output', 'test:value', { value: binding({ kind: BindingSourceKind.ComponentProperty, componentId: 'table', path: 'selectedItem.id' }) }),
        ] } as never} />;
}

const registry = { 'test:table': Table, 'test:value': Value, 'test:detail': Detail };

describe('when rendering a nested template scope', () => {
    it('should give the nested region its own data context and inherit queries and outputs', () => {
        render(<SceneElementView registry={registry} dataContext={{ customer: 'Northwind' }} queryResults={{ customers: ['Northwind'] }}
            element={{ id: 'screen', children: [
                element('table', 'test:table'),
                element('screen-customer', 'test:value', { value: binding({ path: 'customer' }) }),
                element('detail', 'test:detail', { row: binding({ kind: BindingSourceKind.ComponentProperty, componentId: 'table', path: 'selectedItem' }) }),
            ] } as never} />);

        fireEvent.click(screen.getByText('Select'));

        screen.getByTestId('screen-customer').textContent!.should.equal('"Northwind"');
        screen.getByTestId('detail-total').textContent!.should.equal('120');
        screen.getByTestId('detail-customer').textContent!.should.equal('"absent"');
        screen.getByTestId('detail-query').textContent!.should.equal('"Northwind"');
        screen.getByTestId('detail-output').textContent!.should.equal('"INV-2"');
    });
});
