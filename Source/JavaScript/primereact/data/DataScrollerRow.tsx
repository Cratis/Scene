// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readableValue } from './readableValue';

/** The fields that, when present as text, name a record. */
const titleFields = ['label', 'title', 'name', 'text', 'header'];

/**
 * One authored data row, shown readably.
 *
 * A scalar is its text. A record is titled by its first text field among `label`, `title`, `name`, `text` and
 * `header`, and every other field follows as a name and a readable value. No row is ever dumped as JSON.
 */
export function DataScrollerRow({ value }: { value: unknown }) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return <>{readableValue(value)}</>;

    const record = value as Record<string, unknown>;
    const titleField = titleFields.find(field => typeof record[field] === 'string' && record[field] !== '');
    const details = Object.entries(record)
        .filter(([name]) => name !== titleField)
        .map(([name, entry]) => [name, readableValue(entry)] as const)
        .filter(([, text]) => text !== '');

    return (
        <>
            {titleField !== undefined && <strong>{record[titleField] as string}</strong>}
            {details.length > 0 && (
                <dl>
                    {details.map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}
                </dl>
            )}
        </>
    );
}
