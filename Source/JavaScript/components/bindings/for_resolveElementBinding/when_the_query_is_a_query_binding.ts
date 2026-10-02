// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';
import { BindingKind } from '../BindingKind';
import { clearBindings, registerQuery } from '../bindingRegistry';
import { resolveElementBinding } from '../resolveElementBinding';
import { externalComponent } from '../../given';

class Invoices {}

describe('when the query is a query binding', () => {
    let element: ExternalComponent;

    beforeEach(() => {
        clearBindings();
        registerQuery('Invoices', Invoices);
        element = externalComponent('Cratis.Components:dataTable', {
            query: { queryId: 'q-1', query: 'Invoices', arguments: [], results: [] },
        });
    });

    afterEach(() => clearBindings());

    it('should resolve it by the name the binding carries', () => {
        resolveElementBinding(element, BindingKind.Query).should.deep.equal({ name: 'Invoices', target: Invoices });
    });

    it('should still resolve a plain query name', () => {
        element.properties.query = 'Invoices';
        resolveElementBinding(element, BindingKind.Query).target!.should.equal(Invoices);
    });

    it('should resolve nothing for something that is neither', () => {
        element.properties.query = 42;
        resolveElementBinding(element, BindingKind.Query).should.deep.equal({});
    });
});
