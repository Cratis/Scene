// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Whether a template fits the target the browser was opened for, and if it does not, why - Scene's reasons, word for word. */
export interface TemplateBrowserApplicability {
    /** Whether the template applies. Always true when the browser has no target. */
    applies: boolean;

    /** Why it does not apply; empty when it does. */
    reasons: string[];
}
