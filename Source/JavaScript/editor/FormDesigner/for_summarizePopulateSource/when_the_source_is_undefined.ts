// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { summarizePopulateSource } from '../PopulateSourceSummary';
import { PopulateSourceKind } from '../PopulateSourceKind';

describe('when the source is undefined', () => {
    it('should summarize as none', () => {
        summarizePopulateSource(undefined).kind.should.equal(PopulateSourceKind.None);
    });
});
