// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignedProfile } from '../Session/DesignedProfile';
import { noSampleData } from '../../UiProfile/SampleDataSelectionSettings';
import { sampleDataOf } from '../../UiProfile/sampleDataOf';
import { mapShape } from '../../SampleData/sampleDataMappings';

// Choosing the active pack. The mappings stay: they name shapes, and a shape that the new pack does not have is reported by Scene, not silently dropped.
export function chooseActivePack(settings: DesignedProfile, pack: string): DesignedProfile {
    const current = sampleDataOf(settings);
    return current.activePack === pack ? settings : { ...settings, sampleData: { ...current, activePack: pack } };
}

export function mapProfileShape(settings: DesignedProfile, shape: string, readModel: string): DesignedProfile {
    const current = sampleDataOf(settings);
    return { ...settings, sampleData: { ...current, mappings: mapShape(current.mappings, shape, readModel) } };
}

// Binding a read model to a pack of its own replaces an earlier binding of that read model; an empty pack removes it, so the read model uses the active pack again.
export function bindProfileReadModel(settings: DesignedProfile, readModel: string, pack: string): DesignedProfile {
    const current = sampleDataOf(settings);
    const others = current.bindings.filter(binding => binding.target !== readModel);
    return { ...settings, sampleData: { ...current, bindings: pack === '' ? others : [...others, { target: readModel, pack }] } };
}

// Removing a pack that is the active one falls back to the generated data (no active pack, no mappings), which is what the profile means by no choice.
// Bindings to the removed pack go either way; bindings to other packs stay.
export function afterRemovingPack(settings: DesignedProfile, removed: string): DesignedProfile {
    const current = sampleDataOf(settings);
    const bindings = current.bindings.filter(binding => binding.pack !== removed);
    if (current.activePack === removed) return { ...settings, sampleData: { ...noSampleData, bindings } };
    return bindings.length === current.bindings.length ? settings : { ...settings, sampleData: { ...current, bindings } };
}
