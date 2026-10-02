// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, QueryResultShape } from '@cratis/scene.model';
import { cratisComponentsDescriptors } from '../cratisComponentsDescriptors';

describe('when describing the data tables', () => {
    it('should describe every query-bound table under its registry key', () => {
        cratisComponentsDescriptors.map(descriptor => descriptor.component).should.have.members([
            'Cratis.Components:dataTable', 'Cratis.Components:table', 'Cratis.Components:observableDataTable',
        ]);
    });

    it('should bind the query to collection results only', () => {
        for (const descriptor of cratisComponentsDescriptors) {
            const query = descriptor.properties.find(property => property.path === 'query')!;
            query.valueType.should.equal(PropertyValueType.QueryReference);
            query.constraints!.resultShapes!.should.deep.equal([QueryResultShape.Collection]);
        }
    });

    it('should describe the properties the adapter actually reads', () => {
        cratisComponentsDescriptors[0].properties.map(property => property.path).should.have.members(['query', 'emptyMessage', 'dataKey', 'globalFilterFields']);
    });
});
