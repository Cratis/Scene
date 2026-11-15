// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen } from '@cratis/scene.model';

/**
 * The screens the application's saved Scene documents hold, which say whose content a slot of the shell holds when the shell is switched. A document that is
 * missing, is not JSON or holds no screens contributes nothing: what cannot be read cannot be affected by a switch.
 *
 * @param documents The saved documents, as JSON text.
 * @returns The screens, in document order.
 */
export function screensOfDocuments(documents: readonly (string | null | undefined)[]): Screen[] {
    return documents.flatMap(document => {
        if (!document) return [];
        try {
            const parsed = JSON.parse(document) as { screens?: unknown };
            return Array.isArray(parsed.screens) ? parsed.screens.filter((screen): screen is Screen => typeof screen === 'object' && screen !== null && typeof (screen as Screen).name === 'string') : [];
        } catch {
            return [];
        }
    });
}
