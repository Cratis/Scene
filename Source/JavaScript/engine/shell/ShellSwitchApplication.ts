// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneDocument } from '@cratis/scene.model';
import { ShellSlotAction } from './ShellSlotAction';

/** What kind of edit a {@link ShellSwitchChange} is. */
export enum ShellSwitchChangeKind {
    /** The content a screen placed in a slot moved to another slot of the new shell, or was dropped. */
    Content = 'content',

    /** A screen template that fits a slot now fits the slot of the new shell (or none, when its slot was dropped). */
    Placement = 'placement',
}

/** One edit {@link applyShellSwitch} made, for the review list. */
export interface ShellSwitchChange {
    /** Whether it moved content or a template's placement. */
    kind: ShellSwitchChangeKind;

    /** The screen whose content moved. Absent for a placement. */
    screen?: string;

    /** The template whose placement moved. Absent for content. */
    template?: string;

    /** The slot of the current shell. */
    slot: string;

    /** What the plan does with that slot. */
    action: ShellSlotAction;

    /** The slot of the new shell. Absent when the content or the placement is dropped. */
    target?: string;

    /** How many elements moved or were dropped; 1 for a placement. */
    count: number;

    /** A sentence with the real names of the screen or template and the slots, ready to show. */
    description: string;
}

/** The result of applying a {@link ShellSwitchPlan} to a document. */
export interface ShellSwitchApplication {
    /** The document after the switch; the document that was given when nothing was applied. */
    document: SceneDocument;

    /** Whether the plan was applied: false when it has blockers, so there is nothing sound to apply. */
    applied: boolean;

    /** What changed, screens first in document order, then templates; empty when nothing did. */
    changes: ShellSwitchChange[];
}
