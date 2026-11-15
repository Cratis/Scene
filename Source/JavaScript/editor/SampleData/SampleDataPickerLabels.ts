// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Every label the sample data picker shows. The host owns the resource file; declaring the shape here makes a missing label a compile error there. */
export interface SampleDataPickerLabels {
    /** The accessible name of the control and of the menu. */
    menu: string;

    /** The heading over the generated choice. */
    generated: string;

    /** The heading over the user's own data sets. */
    myDataSets: string;

    /** The row that opens the blueprints' packs, and the heading of the panel it opens. */
    blueprints: string;

    /** The footer action that makes a new data set. */
    newDataSet: string;

    /** What the closed control shows for a pack that no package or data set provides any more; `{id}` is its identifier. */
    unavailable: string;
}
