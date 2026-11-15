// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens } from '@cratis/scene.model';
import { bindingSourceMarkersFor } from '../bindingSourceMarkersFor';

const sources = [{ path: 'component.customer-field.value', label: 'Customer - Value' }];

describe('when marking the components an action reads from', () => {
    const markers = bindingSourceMarkersFor({
        sliceId: 'register-order',
        sliceName: 'RegisterOrder',
        inputs: { customer: 'component.customer-field.value', orderId: 'row.id' },
        opens: Opens.None,
    }, sources);

    it('should mark the component an input reads', () => markers.should.deep.equal([{ componentId: 'customer-field', label: 'customer \u2190 Customer - Value' }]));
});

describe('when there is no action', () => {
    it('should mark nothing', () => bindingSourceMarkersFor(undefined, sources).should.be.empty);
});
