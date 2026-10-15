// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleShapeField } from './SampleShapeField';

/**
 * The shape of the rows a read model or component needs: a name and the fields of one row. Components and
 * queries declare shapes and never values; sample data fills the shape at design and preview time.
 */
export interface SampleShape {
    /** The shape's name, matched by name against a pack's sets and a selection's mappings. */
    name: string;

    /** The fields of one row, in the order their values are generated and written. */
    fields: SampleShapeField[];
}

export const SampleShapePropertyNames: (keyof SampleShape)[] = ['name', 'fields'];
