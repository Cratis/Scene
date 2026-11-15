// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StateChangeSlice } from '../../Actions/StateChangeSlice';
import { FieldMarkerKind, fieldMarkersOf } from '../fieldMarkers';

const slice: StateChangeSlice = {
    id: 's', name: 'Add product', origin: [],
    inputs: [{ name: 'sku', type: 'ProductSku', required: true }, { name: 'description', type: 'Text', required: false }],
};

describe('when marking a field', () => {
    it('should say a required property is bound to the command and required by its rules', () => fieldMarkersOf({ name: 'sku' }, slice).should.deep.equal([FieldMarkerKind.BoundToCommand, FieldMarkerKind.InheritedFromRules]));
    it('should say an optional property is only bound to the command', () => fieldMarkersOf({ name: 'description' }, slice).should.deep.equal([FieldMarkerKind.BoundToCommand]));
    it('should follow a rename to the property it fills', () => fieldMarkersOf({ name: 'code', sourceProperty: 'sku' }, slice).should.deep.equal([FieldMarkerKind.BoundToCommand, FieldMarkerKind.InheritedFromRules]));
    it('should call a computed field local', () => fieldMarkersOf({ name: 'sku', composeUsing: 'Compose' }, slice).should.deep.equal([FieldMarkerKind.Local]));
    it('should call a field nothing on the command fills local', () => fieldMarkersOf({ name: 'note' }, slice).should.deep.equal([FieldMarkerKind.Local]));
    it('should call every field local when the command is not known', () => fieldMarkersOf({ name: 'sku' }, undefined).should.deep.equal([FieldMarkerKind.Local]));
});
