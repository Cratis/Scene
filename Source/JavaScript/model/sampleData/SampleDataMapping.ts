// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * An explicit `shape → read model` mapping, for when a pack's shape name differs from the read model's.
 */
export interface SampleDataMapping {
    /** The shape name in the pack. */
    shape: string;

    /** The read model (or shape) name the pack's shape supplies rows for. */
    readModel: string;
}

export const SampleDataMappingPropertyNames: (keyof SampleDataMapping)[] = ['shape', 'readModel'];
