// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { areSampleDataEqual } from '../sampleDataOf';
import type { SampleDataSelectionSettings } from '../SampleDataSelectionSettings';

const choice = (activePack: string, bindings: { target: string; pack: string }[] | undefined): SampleDataSelectionSettings => ({ activePack, mappings: [], bindings: bindings as { target: string; pack: string }[] });

describe('when comparing sample data choices', () => {
    it('should treat bindings in a different order as equal', () =>
        areSampleDataEqual(choice('a', [{ target: 'X', pack: 'p' }, { target: 'Y', pack: 'q' }]), choice('a', [{ target: 'Y', pack: 'q' }, { target: 'X', pack: 'p' }])).should.be.true);
    it('should treat a different pack in a binding as unequal', () =>
        areSampleDataEqual(choice('a', [{ target: 'X', pack: 'p' }]), choice('a', [{ target: 'X', pack: 'q' }])).should.be.false);
    it('should treat missing bindings as none', () => areSampleDataEqual(choice('a', undefined), choice('a', [])).should.be.true);
});
