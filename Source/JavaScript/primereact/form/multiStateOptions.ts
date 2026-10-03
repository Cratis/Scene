// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement, isIconReference } from '@cratis/scene.model';
import { arrayProperty, stringProperty } from '../properties';
import { MultiStateOption } from './MultiStateOption';

/**
 * Reads multi-state options without reshaping their values, dropping any of them, or changing their order.
 *
 * This follows the original PrimeReact control. An option that is a record gives its value through
 * `optionValue` (default, and when that field is absent: its `value` field, and the whole option when it has none) and its label through
 * `optionLabel` (default: its `label` field). Any other option - a string, number, boolean, `null` or an
 * array - is its own value. A label that is not text is shown as its JSON, so a numeric or boolean label,
 * or an option with no label at all, still produces a state the user can reach. A `null` value with no
 * label of its own is labeled with `emptyLabel`.
 *
 * A state's icon is, in order: the option's own `icon`, then the entry of the element's `icons` that is
 * aligned with the option (an array) or keyed by its value (an object). Either may be a PrimeIcons class
 * name, kept for legacy documents, or a qualified {@link IconReference}.
 */
export function multiStateOptions(element: SceneElement, emptyLabel: string): MultiStateOption[] {
    const labelPath = stringProperty(element, 'optionLabel');
    const valuePath = stringProperty(element, 'optionValue');
    const icons = element.properties.icons;

    return arrayProperty(element, 'options').map((option, index) => {
        const record = isRecord(option) ? option : undefined;
        const value = record === undefined ? option : valueOf(record, valuePath);
        const label = record === undefined ? undefined : resolvePath(record, labelPath ?? 'label');
        const icon = toIcon(record?.icon) ?? iconAt(icons, value, index);
        return { label: labelText(label, value, emptyLabel), value, ...(icon === undefined ? {} : { icon }) };
    });
}

function valueOf(record: Record<string, unknown>, valuePath: string | undefined): unknown {
    const authored = valuePath === undefined ? undefined : resolvePath(record, valuePath);
    if (authored !== undefined) return authored;
    return record.value !== undefined ? record.value : record;
}

function resolvePath(record: Record<string, unknown>, path: string): unknown {
    if (Object.hasOwn(record, path)) return record[path];
    let current: unknown = record;
    for (const segment of path.split('.')) {
        if (!isRecord(current) || !Object.hasOwn(current, segment)) return undefined;
        current = current[segment];
    }
    return current;
}

function labelText(label: unknown, value: unknown, emptyLabel: string): string {
    if (typeof label === 'string' && label.length > 0) return label;
    if (label !== undefined && label !== null && label !== '') return display(label);
    return value === null ? emptyLabel : display(value);
}

function display(value: unknown): string {
    const text = typeof value === 'string' ? value : JSON.stringify(value) ?? String(value);
    return text === '' ? '""' : text;
}

function toIcon(candidate: unknown): MultiStateOption['icon'] {
    if (typeof candidate === 'string' && candidate.length > 0) return candidate;
    return isIconReference(candidate) ? candidate : undefined;
}

function iconAt(icons: unknown, value: unknown, index: number): MultiStateOption['icon'] {
    if (Array.isArray(icons)) return toIcon(icons[index]);
    if (!isRecord(icons)) return undefined;

    const isKey = value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
    return isKey ? toIcon(icons[String(value)]) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
