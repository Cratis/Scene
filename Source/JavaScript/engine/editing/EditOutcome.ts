// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneDiagnostic, SceneDocument } from '@cratis/scene.model';

/**
 * The outcome of {@link applyEdit}.
 */
export interface EditOutcome {
    /**
     * The document after the edit - a new object. When the edit was refused this is the document that was passed
     * in, unchanged and the very same object.
     */
    model: SceneDocument;

    /** What was found: errors when the edit was refused, warnings when it went ahead with a caveat. */
    diagnostics: SceneDiagnostic[];

    /** Whether the edit was applied. */
    applied: boolean;
}
