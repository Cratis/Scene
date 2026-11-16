// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { TemplateBrowserEmpty } from './TemplateBrowserEmpty';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import type { TemplateBrowserRailItem } from './TemplateBrowserRailItem';

/** What the browser shows. */
export interface TemplateBrowserModel {
    /** The rail: every template, the application's own, then each blueprint. */
    rail: TemplateBrowserRailItem[];

    /** The rail row in effect: the one asked for, or every template when that row is not there (any more). */
    selectedRailId: string;

    /** The templates of the selected row that match, in the order they are shown. */
    entries: TemplateBrowserEntry[];

    /** The categories of those templates, to narrow by. */
    categories: string[];

    /** How many templates do not fit the target and were left out (dialog) - the browser says so rather than leaving it a mystery. */
    hidden: number;

    /** Why there is nothing to list, when there is not. */
    empty?: TemplateBrowserEmpty;
}
