// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEdit } from '@cratis/scene.model';

/**
 * What running a design-time action did. A batch is submitted to the host whole or not at all.
 */
export interface DesignTimeActionOutcome {
    /** Whether the edit batch was submitted to the host through `submitAction`. */
    submitted: boolean;

    /** The canonical edits the action produced. */
    edits: SceneEdit[];

    /** The action's own diagnostics, and any reason the batch was not submitted. */
    diagnostics: string[];
}
