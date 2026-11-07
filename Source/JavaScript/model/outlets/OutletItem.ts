// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { OutletButton } from './OutletButton';
import type { OutletFilter } from './OutletFilter';
import type { OutletGroup } from './OutletGroup';
import type { OutletMenuEntry } from './OutletMenuEntry';
import type { OutletNavigationItem } from './OutletNavigationItem';
import type { OutletSeparator } from './OutletSeparator';
import type { OutletStat } from './OutletStat';
import type { OutletTab } from './OutletTab';

/**
 * One item of an outlet, told apart by its `kind`.
 */
export type OutletItem =
    | OutletButton
    | OutletMenuEntry
    | OutletSeparator
    | OutletGroup
    | OutletFilter
    | OutletTab
    | OutletStat
    | OutletNavigationItem;
