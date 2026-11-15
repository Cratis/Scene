// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataPack } from '@cratis/scene.model';
import type { UiProfileSettings } from './UiProfileSettings';

/** What managing the sample data packs needs of a host: the packs and read models, saving and removing a pack, and the mappings of the draft. */
export interface SampleDataManagerModel {
    /** The packs the application has made or imported. */
    ownSampleDataPacks: SampleDataPack[];

    /** The read models a shape of the active pack may stand in for. */
    readModels: string[];

    /** Whether the host can save and remove the application's own packs. */
    canManageSampleData: boolean;

    /** Saves an own pack (a new one, an imported one or a replacement), choosing it when `choose` is set. */
    saveSampleDataPack: (pack: SampleDataPack, choose?: boolean) => Promise<string[]>;

    /** Removes an own pack; if it was the active one the draft falls back to the generated data. */
    removeSampleDataPack: (id: string) => Promise<string[]>;

    /** Maps a shape of the active pack to a read model, or clears the mapping with an empty read model. */
    mapSampleDataShape: (shape: string, readModel: string) => void;

    /** The packs a read model may be bound to: the application's own and the blueprints'. */
    bindablePacks: { id: string; label: string }[];

    /** Binds a read model to a pack of its own, or clears the binding with an empty pack. */
    bindSampleDataPack: (readModel: string, pack: string) => void;

    /** The draft, whose sample data selection holds the mappings and bindings. */
    draft: Pick<UiProfileSettings, 'sampleData'>;
}
