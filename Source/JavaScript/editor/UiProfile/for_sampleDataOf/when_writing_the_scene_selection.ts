// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { toSceneSampleData } from '../sampleDataOf';

describe('when writing the scene sample data selection', () => {
    it('should carry the bindings through', () => toSceneSampleData({ activePack: '', mappings: [], bindings: [{ target: 'Orders', pack: 'x' }] })!.bindings.should.deep.equal([{ target: 'Orders', pack: 'x' }]));
    it('should write nothing when the pack, the mappings and the bindings are all empty', () => (toSceneSampleData({ activePack: '', mappings: [], bindings: [] }) === undefined).should.be.true);
});
