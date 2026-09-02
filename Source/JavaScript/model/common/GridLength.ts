// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GridUnitType } from './GridUnitType';

/**
 * The length of a grid row or column, which can be absolute, sized to its content, or a weighted
 * share of the space the absolute and content-sized tracks leave behind.
 */
export interface GridLength {
    value: number;
    unitType: GridUnitType;
}

export const GridLengthPropertyNames: (keyof GridLength)[] = ['value', 'unitType'];
