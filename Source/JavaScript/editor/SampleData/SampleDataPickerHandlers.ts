// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What choosing in the sample data picker does. */
export interface SampleDataPickerHandlers {
    /** A choice was made: the pack identifier, or an empty string for the generated data. */
    onChoose: (pack: string) => void;

    /** The user asked for a new data set. Absent when the host cannot make one. */
    onNewDataSet?: () => void;
}
