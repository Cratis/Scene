// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GridLength } from '../../common';

/**
 * One column of a {@link Grid}.
 */
export interface ColumnDefinition {
    width: GridLength;
    minimumWidth: number;
    maximumWidth: number;
}

export const ColumnDefinitionPropertyNames: (keyof ColumnDefinition)[] = ['width', 'minimumWidth', 'maximumWidth'];
