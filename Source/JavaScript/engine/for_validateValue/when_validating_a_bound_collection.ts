// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind, PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';
import { validateValue } from '../editing/validateValue';

describe('when validating a bound collection property', () => {
    const inputs: PropertyDescriptor = {
        path: 'inputs', label: 'Inputs', group: 'Fields', valueType: PropertyValueType.Collection,
        item: { label: 'input', properties: [{ path: 'property', label: 'Property', group: 'Field', valueType: PropertyValueType.String }] },
        acceptedBindingKinds: [BindingSourceKind.DataContext, BindingSourceKind.ComponentProperty],
    };
    const tableSelection = { kind: BindingSourceKind.ComponentProperty, componentId: 'table', path: 'selectedItem' };

    it('should accept a binding of an accepted kind instead of a list', () => (validateValue(inputs, tableSelection) === undefined).should.equal(true));

    it('should refuse a binding of a kind the property does not accept', () =>
        validateValue(inputs, { kind: BindingSourceKind.QueryResult, query: 'all', path: '' })!
            .should.equal('a queryResult binding is not accepted here; use dataContext or componentProperty'));

    it('should still validate an authored list item by item', () => {
        (validateValue(inputs, [{ id: 'a', property: 'name' }]) === undefined).should.equal(true);
        validateValue(inputs, [{ property: 'name' }])!.should.equal('every item needs an id');
    });

    it('should not treat a binding as a value where no binding kinds are declared', () =>
        validateValue({ ...inputs, acceptedBindingKinds: undefined }, tableSelection)!.should.equal('expected a list'));
});
