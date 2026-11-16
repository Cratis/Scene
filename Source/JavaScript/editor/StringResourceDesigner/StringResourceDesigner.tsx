// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { computeMissingTranslations } from './computeMissingTranslations';
import './StringResourceDesigner.css';

export interface StringResourceDesignerProps {
    /** Every locale's resource entries, keyed by locale - see `computeMissingTranslations`. */
    perLocale: Record<string, Record<string, string>>;
}

/**
 * The per-locale table view for StudioIssues#159: one row per resource key, one column per discovered
 * locale, missing entries flagged - the "extract to resource" action's companion surface. Locale content
 * is supplied already parsed (see `computeMissingTranslations`); this component only renders it.
 */
export function StringResourceDesigner({ perLocale }: StringResourceDesignerProps) {
    const locales = Object.keys(perLocale);
    const missingByKey = new Map(computeMissingTranslations(perLocale).map(entry => [entry.key, new Set(entry.missingLocales)]));
    const keys = [...new Set(locales.flatMap(locale => Object.keys(perLocale[locale])))];

    return (
        <table className="studio-editor-string-resource-designer">
            <thead>
                <tr>
                    <th>Key</th>
                    {locales.map(locale => <th key={locale}>{locale}</th>)}
                </tr>
            </thead>
            <tbody>
                {keys.map(key => (
                    <tr key={key}>
                        <td>{key}</td>
                        {locales.map(locale => {
                            const isMissing = missingByKey.get(key)?.has(locale) ?? false;
                            return (
                                <td key={locale} className={isMissing ? 'studio-editor-string-resource-designer-missing' : undefined}>
                                    {isMissing ? '—' : perLocale[locale][key]}
                                </td>
                            );
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
