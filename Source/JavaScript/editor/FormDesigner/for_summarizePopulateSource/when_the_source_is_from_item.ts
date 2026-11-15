// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PopulateFromItem } from '@cratis/scene.model';
import { summarizePopulateSource } from '../PopulateSourceSummary';
import { PopulateSourceKind } from '../PopulateSourceKind';

describe('when the source is from item', () => {
    const source: PopulateFromItem = { itemBinding: { path: 'item' } };

    it('should summarize as fromItem', () => {
        summarizePopulateSource(source).kind.should.equal(PopulateSourceKind.FromItem);
    });
});
