// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryResultShape, type QueryCandidate } from '@cratis/scene.model';
import { availableSourcesFor } from '../availableSourcesFor';

const candidate = (parameters: { name: string; type: string; required: boolean }[]): QueryCandidate =>
    ({ id: 'q', name: 'Q', origin: [], parameters, resultShape: QueryResultShape.Collection, resultFields: [] });

describe('when collecting what a screen can feed its queries and actions from', () => {
    it('should always offer the row an action is activated on', () => availableSourcesFor([])['row.id'].should.equal('Guid'));
    it('should always offer the selected row', () => availableSourcesFor([])['selection.id'].should.equal('Guid'));
    it('should offer a route value for each parameter a query needs', () =>
        availableSourcesFor([candidate([{ name: 'equipmentId', type: 'Guid', required: true }])])['route.equipmentId'].should.equal('Guid'));
    it('should offer a route value once even if several queries need it', () =>
        Object.keys(availableSourcesFor([candidate([{ name: 'a', type: 'Guid', required: true }]), candidate([{ name: 'a', type: 'Guid', required: true }])])).filter(key => key === 'route.a').length.should.equal(1));
});
