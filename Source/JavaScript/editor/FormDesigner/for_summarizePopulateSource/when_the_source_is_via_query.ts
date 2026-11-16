// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PopulateViaQuery } from '@cratis/scene.model';
import { summarizePopulateSource } from '../PopulateSourceSummary';
import { PopulateSourceKind } from '../PopulateSourceKind';

describe('when the source is via query', () => {
    const source: PopulateViaQuery = { queryName: 'GetInvoice', parameterBindings: { invoiceId: { path: 'route.invoiceId' } } };
    const result = summarizePopulateSource(source);

    it('should summarize as viaQuery', () => {
        result.kind.should.equal(PopulateSourceKind.ViaQuery);
    });

    it('should carry the query name', () => {
        result.queryName!.should.equal('GetInvoice');
    });

    it('should carry the parameter names', () => {
        result.parameterNames.should.deep.equal(['invoiceId']);
    });
});
