// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The rows a {@link SampleDataPack} provides for one shape.
 */
export interface SampleDataSet {
    /** The shape's name. Matches a read model of the same name unless the selection maps it elsewhere. */
    shape: string;

    /** The rows: JSON objects keyed by the shape's field names. */
    rows: Record<string, unknown>[];
}

export const SampleDataSetPropertyNames: (keyof SampleDataSet)[] = ['shape', 'rows'];
