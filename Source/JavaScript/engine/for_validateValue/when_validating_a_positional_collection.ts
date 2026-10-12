// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyDescriptor, PropertyValueType } from '@cratis/scene.model';
import { validateValue } from '../editing/validateValue';

describe('when validating a positional collection', () => {
    const descriptor: PropertyDescriptor = {
        path: 'datasets', label: 'Datasets', group: 'Data', valueType: PropertyValueType.Collection,
        item: { label: 'Dataset', positional: true, open: true, properties: [{ path: 'label', label: 'Label', group: 'Data', valueType: PropertyValueType.String }] },
    };

    it('should accept items that carry no id', () => {
        (validateValue(descriptor, [{ label: 'A' }, { label: 'A' }]) === undefined).should.be.true;
    });

    it('should accept items that carry an id', () => {
        (validateValue(descriptor, [{ id: 'one', label: 'A' }]) === undefined).should.be.true;
    });

    it('should still check the fields of an item', () => {
        validateValue(descriptor, [{ label: 1 }])!.should.contain('item 1: label');
    });

    it('should refuse an item that is not a record', () => {
        validateValue(descriptor, ['A'])!.should.contain('item 1 is not a record');
    });

    it('should still need an id when the collection is not positional', () => {
        validateValue({ ...descriptor, item: { ...descriptor.item!, positional: false } }, [{ label: 'A' }])!.should.equal('every item needs an id');
    });
});
