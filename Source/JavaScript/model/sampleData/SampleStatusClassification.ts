// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Which values of a pack's status column belong to which {@link SampleStatus}. A value in none of the lists is neutral. */
export interface SampleStatusClassification {
    good?: string[];

    pending?: string[];

    bad?: string[];

    neutral?: string[];
}

export const SampleStatusClassificationPropertyNames: (keyof SampleStatusClassification)[] = ['good', 'pending', 'bad', 'neutral'];
