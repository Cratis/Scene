// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { arrayProperty, stringProperty } from '../properties';
import { MultiStateOption } from './MultiStateOption';

/**
 * Reads multi-state options without reshaping their values or changing their stored order.
 *
 * Legacy documents may choose their label and value fields through `optionLabel` and `optionValue`; a
 * state can also carry a PrimeIcon class directly or receive one from the aligned `icons` collection.
 */
export function multiStateOptions(element: SceneElement): MultiStateOption[] {
    const labelProperty = stringProperty(element, 'optionLabel', 'label');
    const valueProperty = stringProperty(element, 'optionValue', 'value');
    const icons = element.properties.icons;

    return arrayProperty(element, 'options').flatMap((option, index) => {
        if (option === null || typeof option === 'string' || typeof option === 'number' || typeof option === 'boolean') {
            return [{ label: String(option), value: option, icon: iconAt(icons, option, index) }];
        }

        if (typeof option !== 'object' || Array.isArray(option)) return [];
        const record = option as Record<string, unknown>;
        const value = firstValue(record, [valueProperty, 'value', labelProperty, 'label']);
        const label = firstValue(record, [labelProperty, 'label']) ?? value;
        if (typeof label !== 'string' || value === undefined) return [];

        const icon = typeof record.icon === 'string' ? record.icon : iconAt(icons, value, index);
        return [{ label, value, ...(icon === undefined ? {} : { icon }) }];
    });
}

function firstValue(record: Record<string, unknown>, names: string[]): unknown {
    for (const name of names) {
        if (Object.hasOwn(record, name)) return record[name];
    }
    return undefined;
}

function iconAt(icons: unknown, value: unknown, index: number): string | undefined {
    if (Array.isArray(icons)) return typeof icons[index] === 'string' ? icons[index] : undefined;
    if (icons === null || typeof icons !== 'object' || Array.isArray(icons)) return undefined;

    const key = typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : undefined;
    const icon = key === undefined ? undefined : (icons as Record<string, unknown>)[key];
    return typeof icon === 'string' ? icon : undefined;
}
