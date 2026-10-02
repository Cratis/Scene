// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryResultShape } from '../queries';

/**
 * The limits a property's value has to stay within. Every limit is optional; an absent one means no limit.
 */
export interface PropertyConstraints {
    /** The property must have a value. */
    required?: boolean;

    /** The smallest allowed number. */
    minimum?: number;

    /** The largest allowed number. */
    maximum?: number;

    /** The number must be a whole number. */
    integer?: boolean;

    minimumLength?: number;
    maximumLength?: number;

    /** A regular expression a string must match in full. */
    pattern?: string;

    /** The fewest items a collection may hold. */
    minimumItems?: number;

    /** The most items a collection may hold. */
    maximumItems?: number;

    /** For a `QueryReference`: the result shapes the component can bind to. Absent means any. */
    resultShapes?: `${QueryResultShape}`[];
}

export const PropertyConstraintsPropertyNames: (keyof PropertyConstraints)[] = [
    'required', 'minimum', 'maximum', 'integer', 'minimumLength', 'maximumLength', 'pattern',
    'minimumItems', 'maximumItems', 'resultShapes',
];
