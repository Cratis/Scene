// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A resource key present in at least one locale's `.strings` file but missing from at least one other -
 * see `computeMissingTranslations`.
 */
export interface MissingTranslation {
    key: string;
    missingLocales: string[];
}
