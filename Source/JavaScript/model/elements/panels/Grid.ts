// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Panel } from '../Panel';
import { RowDefinition } from './RowDefinition';
import { ColumnDefinition } from './ColumnDefinition';

/**
 * Lays its children out in rows and columns. A child states which cell it occupies through the
 * `Grid.Row`, `Grid.Column`, `Grid.RowSpan` and `Grid.ColumnSpan` keys of its `properties`.
 */
export interface Grid extends Panel {
    rows: RowDefinition[];
    columns: ColumnDefinition[];
}

export const GridPropertyNames: (keyof Grid)[] = ['rows', 'columns'];
