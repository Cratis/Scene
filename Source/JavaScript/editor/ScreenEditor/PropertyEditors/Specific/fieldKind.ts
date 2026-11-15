// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The kind a field's type name falls under, which is what a `field` editor filters by: `number`, `boolean`, `date`, `id` or `string`.
// Type names come from the model as the host spells them (`int`, `Guid`, `DateTimeOffset`), so this reads them loosely.
export function fieldKindOf(type: string): 'number' | 'boolean' | 'date' | 'id' | 'string' {
    const name = type.toLowerCase().replace(/[?[\]]/g, '');
    if (/^(u?int\d*|long|short|byte|float|double|decimal|number|single)$/.test(name)) return 'number';
    if (name === 'bool' || name === 'boolean') return 'boolean';
    if (/^(date|time|datetime|datetimeoffset|dateonly|timeonly|timestamp)$/.test(name)) return 'date';
    if (name === 'guid' || name === 'uuid') return 'id';
    return 'string';
}
