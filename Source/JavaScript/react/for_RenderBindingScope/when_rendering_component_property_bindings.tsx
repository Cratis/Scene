// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { fireEvent, render, screen } from '@testing-library/react';
import { BindingNullBehavior, BindingSourceKind, ExternalComponent, Panel } from '@cratis/scene.model';
import { RegisteredComponentProps } from '../renderer';
import { SceneElementView } from '../SceneElementView';

function Table({ bindingOutputs }: RegisteredComponentProps) {
    return <>
        <button type='button' onClick={() => bindingOutputs?.setOutput('selectedItem', { number: 'INV-2' })}>Select second</button>
        <button type='button' onClick={() => bindingOutputs?.clearOutput('selectedItem')}>Clear</button>
    </>;
}

function Detail({ element }: RegisteredComponentProps) {
    return <span>{String(element.properties.invoice ?? 'unchanged')}</span>;
}

const table = { id: 'table', componentName: 'test:table', properties: {}, slots: {} } as unknown as ExternalComponent;
const detail = {
    id: 'detail',
    componentName: 'test:detail',
    properties: {
        invoice: {
            kind: BindingSourceKind.ComponentProperty,
            componentId: 'table',
            path: 'selectedItem.number',
            nullBehavior: BindingNullBehavior.Preserve,
        },
    },
    slots: {},
} as unknown as ExternalComponent;
const root = { id: 'root', children: [table, detail] } as unknown as Panel;

describe('when rendering component property bindings', () => {
    it('should share reactive output scope across sibling components and preserve cleared values', () => {
        render(<SceneElementView element={root} registry={{ 'test:table': Table, 'test:detail': Detail }} />);

        Boolean(screen.getByText('unchanged')).should.equal(true);
        fireEvent.click(screen.getByText('Select second'));
        Boolean(screen.getByText('INV-2')).should.equal(true);
        fireEvent.click(screen.getByText('Clear'));
        Boolean(screen.getByText('INV-2')).should.equal(true);
    });
});
