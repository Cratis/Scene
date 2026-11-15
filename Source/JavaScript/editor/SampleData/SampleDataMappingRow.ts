// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One row of the mapping table: a shape a pack carries data for, and the read model it stands in for. */
export interface SampleDataMappingRow {
    /** The shape the pack names. */
    shape: string;

    /** The read model it is mapped to, or empty when the shape already is the read model's name. */
    readModel: string;

    /** Whether the shape's name is itself a read model of the application, so a mapping is not needed. */
    matchesByName: boolean;
}
