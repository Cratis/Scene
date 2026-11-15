// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BlueprintPinStatus } from '@cratis/scene.engine';

/** What the gallery says about a pinned reference to a blueprint that has a different version on offer. */
export interface BlueprintUpdate {
    /** Where the pin stands (Scene's `evaluateBlueprintPin`). */
    status: BlueprintPinStatus;

    /** The version the reference was chosen from. */
    from: string;

    /** The version on offer. */
    to: string;

    /** The pin that was evaluated. */
    pin: string;

    /** Said in a sentence, for a tooltip. */
    message: string;
}
