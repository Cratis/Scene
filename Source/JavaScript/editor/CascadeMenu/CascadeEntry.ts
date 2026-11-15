// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CascadeEntryKind } from './CascadeEntryKind';

/** A further action on a row, offered beside it - for example copying a blueprint template into the user's own. */
export interface CascadeSecondaryAction {
    /** What the action is called. */
    label: string;

    /** Called when the action is chosen. The menu stays open unless `closes` is set. */
    onActivate: () => void;

    /** Whether the menu closes after the action. */
    closes?: boolean;
}

/** A heading, subheading, separator or note: a row with a label and nothing to choose. */
export interface CascadeStaticEntry {
    kind: CascadeEntryKind.Heading | CascadeEntryKind.Subheading | CascadeEntryKind.Separator | CascadeEntryKind.Note;
    id: string;
    label: string;
}

/** A row that does something when chosen. */
export interface CascadeItemEntry {
    kind: CascadeEntryKind.Item;
    id: string;
    label: string;

    /** Text aligned to the right of the row, such as a locale. */
    trailing?: string;

    /** A line under the label. */
    description?: string;

    /** Whether this is the current choice: it shows a check and the highlighted row. */
    checked?: boolean;

    /** Why the row cannot be chosen, when it cannot. */
    disabledReason?: string;

    /** Further actions offered beside the row, in order. */
    actions?: CascadeSecondaryAction[];

    /** Called when the row is chosen. The menu closes afterwards. */
    onActivate: () => void;
}

/** A row that opens a further panel. */
export interface CascadeSubmenuEntry {
    kind: CascadeEntryKind.Submenu;
    id: string;
    label: string;

    /** The rows of the panel it opens. */
    entries: CascadeEntry[];
}

/** One row of a cascading menu. */
export type CascadeEntry = CascadeStaticEntry | CascadeItemEntry | CascadeSubmenuEntry;
