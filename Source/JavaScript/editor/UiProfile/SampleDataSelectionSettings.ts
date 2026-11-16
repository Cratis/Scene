// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataBinding, SampleDataMapping } from '@cratis/scene.model';

/**
 * The sample data an application uses, chosen once in the UI Profile setup and inherited everywhere: the active pack,
 * the shape to read model mappings that go with it and the read models bound to a pack of their own. It is the `sampleData` of Scene's `UiProfile`.
 */
export interface SampleDataSelectionSettings {
    /** The active pack's identifier - an own pack or a blueprint's - or empty for the generated data. */
    activePack: string;

    /** The shapes the pack names that stand in for a read model of another name. */
    mappings: SampleDataMapping[];

    /** The read models bound to a pack of their own, which overrides the active pack for that read model. */
    bindings: SampleDataBinding[];
}

/** No pack chosen, no mappings: the generated, deterministic data. */
export const noSampleData: SampleDataSelectionSettings = { activePack: '', mappings: [], bindings: [] };
