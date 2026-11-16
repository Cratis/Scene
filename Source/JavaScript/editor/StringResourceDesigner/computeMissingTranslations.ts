// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MissingTranslation } from './MissingTranslation';

/**
 * Finds every key present in at least one locale's `.strings` file but missing from at least one other -
 * part of StudioIssues#159's missing-translation indicators. Takes already-parsed key/value maps per
 * locale (from `StringsFile.Parse`/`StringsFiles` discovery on the backend, per
 * `Documentation/screenplay/internationalization.md` in the Screenplay repo) rather than raw file text -
 * parsing the `.strings` format itself belongs there, not duplicated here.
 *
 * @param perLocale Every locale's resource entries, keyed by locale.
 * @returns One {@link MissingTranslation} per key that isn't present in every locale, in first-seen key order.
 */
export function computeMissingTranslations(perLocale: Record<string, Record<string, string>>): MissingTranslation[] {
    const locales = Object.keys(perLocale);
    const allKeys = new Set<string>();
    for (const locale of locales) {
        for (const key of Object.keys(perLocale[locale])) {
            allKeys.add(key);
        }
    }

    const missing: MissingTranslation[] = [];
    for (const key of allKeys) {
        const missingLocales = locales.filter(locale => !(key in perLocale[locale]));
        if (missingLocales.length > 0) {
            missing.push({ key, missingLocales });
        }
    }

    return missing;
}
