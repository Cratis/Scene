// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SampleDataPack } from '@cratis/scene.model';

/** What reading an import produced: the pack when it is usable, and every problem Scene or the reader found. */
export interface SampleDataImportResult {
    /** The pack to save. Absent when the text could not be read at all. */
    pack?: SampleDataPack;

    /** Problems reading the text or, from Scene's `validateSampleDataPack`, with the pack read from it. A pack with problems is not saved. */
    problems: string[];
}
