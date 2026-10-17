// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleStatus, SampleStatusClassification } from '@cratis/scene.model';

/** The one line that says what the generic pack is: the pack a preview uses when none is chosen. */
export const genericSampleDataDescription = 'Made-up rows typed by each field: a name, an amount, a date and a status.';

/** The columns of the generic pack's table. */
export const genericSampleDataColumns: readonly string[] = ['Name', 'Amount', 'Date', 'Status'];

/** The column of the generic pack that is drawn as pills. */
export const genericSampleDataStatusColumn = 'Status';

/** The statuses of the generic pack's `Status` column. */
export const genericSampleDataStatuses: SampleStatusClassification = { good: ['Active'], pending: ['Pending'], bad: ['Inactive'] };

/** The help text a designer shows beside the sample data choice. */
export const sampleDataNeverShipsNote = 'Sample data is for the preview only. Production builds never include it.';

/**
 * Classifies a status value for its pill. Values are compared without regard to letter case or surrounding space, the same way in every locale,
 * so a pack lists the words of its own language. A value the pack does not name is neutral.
 *
 * @param classification The pack's classification, if it has one.
 * @param value The value of the status column.
 * @returns How the pill is coloured.
 */
export function classifySampleStatus(classification: SampleStatusClassification | undefined, value: unknown): SampleStatus {
    if (classification === undefined || typeof value !== 'string') return SampleStatus.Neutral;
    const key = value.trim().toLowerCase();
    const has = (list: string[] | undefined) => (list ?? []).some(item => item.trim().toLowerCase() === key);
    return has(classification.good) ? SampleStatus.Good
        : has(classification.pending) ? SampleStatus.Pending
            : has(classification.bad) ? SampleStatus.Bad
                : SampleStatus.Neutral;
}
