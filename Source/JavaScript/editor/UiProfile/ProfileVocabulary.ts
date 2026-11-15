// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** What a resolved profile makes available to screens, with the slots each piece declares. */
export interface ProfileVocabulary {
    /** Layout name to the slot names it declares. */
    layouts: Map<string, string[]>;

    /** Screen template name to the slot names it declares. */
    screenTemplates: Map<string, string[]>;

    /** Dialog template name to the slot names it declares. */
    dialogTemplates: Map<string, string[]>;
}
