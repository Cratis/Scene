// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyDescriptor, PropertyValueType, QueryBinding, QueryCandidate, QueryResultShape } from '@cratis/scene.model';

export const descriptor: PropertyDescriptor = {
    path: 'query', label: 'Query', group: 'Data', valueType: PropertyValueType.QueryReference,
    constraints: { resultShapes: [QueryResultShape.Collection] },
};

export const candidate: QueryCandidate = {
    id: 'q-invoices',
    name: 'InvoicesForCustomer',
    origin: [{ kind: 'feature', id: 'f-billing', name: 'Billing' }, { kind: 'slice', id: 's-invoices', name: 'Invoices' }],
    parameters: [{ name: 'customerId', type: 'Guid', required: true }, { name: 'limit', type: 'double', required: false }],
    resultShape: 'collection',
    resultFields: [{ name: 'id', type: 'Guid', isIdentity: true }, { name: 'total', type: 'decimal' }],
};

export function binding(overrides: Partial<QueryBinding> = {}): QueryBinding {
    return {
        queryId: 'q-invoices',
        query: 'InvoicesForCustomer',
        arguments: [{ parameter: 'customerId', source: { path: 'customer.id' } }],
        results: [{ target: 'total', field: 'total' }],
        ...overrides,
    };
}
