// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingNullBehavior, BindingSourceKind } from '@cratis/scene.model';
import { resolveBindingExpression } from '../resolveBindingExpression';

describe('when resolving typed sources', () => {
    const scope = {
        dataContext: { selected: { id: 'invoice-1' } },
        queryResults: { invoices: { current: { id: 'invoice-2' } } },
        componentOutputs: { table: { selectedItem: { id: 'invoice-3' } } },
    };

    it('should read from the inherited data context by default', () => {
        (resolveBindingExpression({ path: 'selected.id' }, scope) as string).should.equal('invoice-1');
    });

    it('should read from a named query result', () => {
        (resolveBindingExpression({ kind: BindingSourceKind.QueryResult, query: 'invoices', path: 'current.id' }, scope) as string).should.equal('invoice-2');
    });

    it('should read another component output property', () => {
        (resolveBindingExpression({ kind: BindingSourceKind.ComponentProperty, componentId: 'table', path: 'selectedItem.id' }, scope) as string).should.equal('invoice-3');
    });

    it('should clear null values when requested', () => {
        (resolveBindingExpression({ path: 'missing', nullBehavior: BindingNullBehavior.Clear }, scope) === null).should.be.true;
    });
});
