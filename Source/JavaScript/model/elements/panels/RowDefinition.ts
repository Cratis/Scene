// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GridLength } from '../../common';

/**
 * One row of a {@link Grid}.
 */
export interface RowDefinition {
    height: GridLength;
    minimumHeight: number;
    maximumHeight: number;
}

export const RowDefinitionPropertyNames: (keyof RowDefinition)[] = ['height', 'minimumHeight', 'maximumHeight'];
