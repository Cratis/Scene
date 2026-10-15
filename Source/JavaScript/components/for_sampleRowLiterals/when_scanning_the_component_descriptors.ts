// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findDescriptorSampleRowLiterals } from '@cratis/scene.engine';
import { cratisComponentsDescriptors } from '../cratisComponentsDescriptors';

// Spec §11 SD1: components declare shapes only. Demo rows belong to sample-data packs, never to a descriptor default.
describe('when scanning the component descriptors for sample row literals', () => {
    it('should find no row literals in any descriptor default', () => findDescriptorSampleRowLiterals(cratisComponentsDescriptors).should.deep.equal([]));
});
