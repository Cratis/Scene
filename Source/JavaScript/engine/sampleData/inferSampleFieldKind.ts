// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleFieldKind, SampleShapeField } from '@cratis/scene.model';

const typeKinds = new Map<string, SampleFieldKind>([
    ['guid', SampleFieldKind.Id],
    ['uuid', SampleFieldKind.Id],
    ['int', SampleFieldKind.WholeNumber],
    ['int16', SampleFieldKind.WholeNumber],
    ['int32', SampleFieldKind.WholeNumber],
    ['int64', SampleFieldKind.WholeNumber],
    ['short', SampleFieldKind.WholeNumber],
    ['long', SampleFieldKind.WholeNumber],
    ['integer', SampleFieldKind.WholeNumber],
    ['number', SampleFieldKind.WholeNumber],
    ['decimal', SampleFieldKind.Amount],
    ['double', SampleFieldKind.Amount],
    ['float', SampleFieldKind.Amount],
    ['single', SampleFieldKind.Amount],
    ['money', SampleFieldKind.Amount],
    ['currency', SampleFieldKind.Amount],
    ['bool', SampleFieldKind.Boolean],
    ['boolean', SampleFieldKind.Boolean],
    ['date', SampleFieldKind.Date],
    ['dateonly', SampleFieldKind.Date],
    ['datetime', SampleFieldKind.DateTime],
    ['datetimeoffset', SampleFieldKind.DateTime],
    ['timestamp', SampleFieldKind.DateTime],
]);

const nameKinds: [string[], SampleFieldKind][] = [
    [['email'], SampleFieldKind.Email],
    [['phone', 'mobile'], SampleFieldKind.Phone],
    [['company', 'organization', 'organisation'], SampleFieldKind.Company],
    [['city', 'town'], SampleFieldKind.City],
    [['product', 'item', 'title', 'subject', 'description'], SampleFieldKind.Text],
    [['name', 'customer', 'assignee', 'owner', 'author', 'contact', 'manager', 'employee'], SampleFieldKind.Name],
];

/**
 * The kind of value to generate for a field. An explicit `kind` wins; otherwise a field with `enumValues` is
 * an enum, a recognised `type` decides, and failing that the field's name does (an `Id` suffix, `email`,
 * `phone`, `company`, `city`, person-like names), with free text as the fallback. A trailing `?` on the type
 * is ignored and type names compare case-insensitively.
 */
export function inferSampleFieldKind(field: SampleShapeField): SampleFieldKind {
    if (field.kind !== undefined && field.kind !== null) return field.kind as SampleFieldKind;
    if (field.enumValues !== undefined && field.enumValues !== null && field.enumValues.length > 0) return SampleFieldKind.Enum;

    let type = (field.type ?? '').trim().toLowerCase();
    if (type.endsWith('?')) type = type.slice(0, -1);
    const byType = typeKinds.get(type);
    if (byType !== undefined) return byType;

    const name = field.name ?? '';
    const lower = name.toLowerCase();
    if (lower === 'id' || (name.length > 2 && name.endsWith('Id'))) return SampleFieldKind.Id;
    for (const [fragments, kind] of nameKinds) {
        if (fragments.some(fragment => lower.includes(fragment))) return kind;
    }

    return SampleFieldKind.Text;
}
