// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent, SceneEditKind } from '@cratis/scene.model';
import { generateCommandFieldsAction } from '../forms/generateCommandFieldsAction';

describe('when generating fields', () => {
    const descriptor = { component: 'Cratis.Components:commandForm', properties: [] };
    const element = { id: 'form', componentName: 'Cratis.Components:commandForm', properties: { command: 'RegisterInvoice' }, slots: {} } as unknown as ExternalComponent;

    it('should produce a deterministic set-property edit without overwriting authored fields', () => {
        const result = generateCommandFieldsAction.execute({
            descriptor,
            element,
            commandMetadata: { properties: [{ name: 'invoiceId', type: 'Guid' }, { name: 'customerName', type: 'String', label: 'Customer' }] },
        });

        result.diagnostics.should.be.empty;
        result.edits.should.deep.equal([{ kind: SceneEditKind.SetProperty, nodeId: 'form', path: 'inputs', value: [
            { property: 'invoiceId', type: 'guid', label: 'Invoice Id', column: 1, width: '1fr' },
            { property: 'customerName', type: 'string', label: 'Customer', column: 2, width: '1fr' },
        ] }]);
    });

    it('should refuse to overwrite authored manual fields', () => {
        const result = generateCommandFieldsAction.execute({
            descriptor,
            element: { ...element, properties: { inputs: [] } } as unknown as ExternalComponent,
            commandMetadata: { properties: [{ name: 'invoiceId', type: 'Guid' }] },
        });

        result.edits.should.be.empty;
        result.diagnostics.should.not.be.empty;
    });
});
