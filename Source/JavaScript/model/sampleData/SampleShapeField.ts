// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleFieldKind } from './SampleFieldKind';

/**
 * One field of a {@link SampleShape}: what the generator needs to know to produce a plausible value.
 * A field gives a `kind`, or just a `type` (and name) from which the kind is inferred.
 */
export interface SampleShapeField {
    /** The field's name, as it appears on each row. */
    name: string;

    /** The field's type name (`string`, `Guid`, `int`, `decimal`, `bool`, `DateTime` ...); used to infer the kind when `kind` is absent. */
    type?: string;

    /** The kind of value, overriding what would be inferred from `type` and `name`. Accepts the {@link SampleFieldKind} members or their strings. */
    kind?: `${SampleFieldKind}`;

    /** Whether the field may be null. A nullable field is occasionally null in generated data. */
    nullable?: boolean;

    /** The member names of an enum field. Generated values are always one of these. */
    enumValues?: string[];

    /** The smallest value of a numeric field (inclusive). */
    min?: number;

    /** The largest value of a numeric field (inclusive). */
    max?: number;
}

export const SampleShapeFieldPropertyNames: (keyof SampleShapeField)[] = ['name', 'type', 'kind', 'nullable', 'enumValues', 'min', 'max'];
