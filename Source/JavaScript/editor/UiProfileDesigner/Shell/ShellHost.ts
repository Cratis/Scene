// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen, TemplateReference } from '@cratis/scene.model';
import type { ShellSwitchToApply } from './applyShellSwitchToDocuments';
import type { ShellSlotMove } from '@cratis/scene.engine';
import type { EffectiveShell } from '@cratis/scene.engine';
import type { ShellBrowserHost } from './ShellSwitchDialog';
import type { NewShellStart } from './ownShellDocument';

/** What the host gives the Shell node: the template browser's assets and words, the application's screens, and what it can do with a shell that the designer cannot. */
export interface ShellHost {
    /** What the template browser needs to draw its cards. Without it the shell cannot be chosen from the browser, so *Change…* is not offered. */
    browser?: ShellBrowserHost;

    /** The application's screens, which say whose content a slot holds. */
    screens?: readonly Screen[];

    /** Opens the shell for editing: the template canvas of an own shell; for a blueprint's, the host copies it to the application's templates first. */
    onEditShell?: (reference: TemplateReference, own: boolean) => void;

    /**
     * Makes an own shell - an application template that is the root, written by `ownShellDocument` - asking the author what to call it, and resolves to the identifier of
     * the template it made, or to nothing when none was made (the author cancelled, or it was refused). The designer then makes it the application's shell - unless
     * that needs a decision about content that has no slot in it, which *Change…* asks - and opens it with `onEditShell`; it is among the application's own
     * templates, where *Change…* lists it and *Edit…* opens it.
     */
    onCreateShell?: (start: NewShellStart, from: EffectiveShell) => Promise<string | undefined>;

    /**
     * Moves the content of the screens out of the slots the new shell lacks, as the plan says (`applyShellSwitchToDocuments` rewrites the saved documents). Resolves to whether it was done; the switch is not made
     * when it was not. Absent when the host cannot rewrite screens, which makes a switch that needs it unavailable rather than silent.
     */
    onRemapSlots?: (moves: readonly ShellSlotMove[], application: ShellSwitchToApply) => Promise<boolean>;
}
