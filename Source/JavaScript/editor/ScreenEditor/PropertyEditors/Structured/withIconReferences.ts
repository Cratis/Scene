// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { parseIconReference, PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';

// An outlet's buttons keep their icon as the `library#key` text Scene's model gives it (OutletAction.icon), while the descriptor calls it an icon
// reference. The value is checked with each such text read as the reference it names, so an imported toolbar is not reported as saved wrong.
export function withIconReferences(descriptor: PropertyDescriptor, value: unknown): unknown {
    if (descriptor.valueType === PropertyValueType.Icon && typeof value === 'string') return parseIconReference(value) ?? value;
    if (Array.isArray(value) && descriptor.item) return value.map(item => withMembersRead(descriptor.item!.properties, item));
    if (descriptor.properties) return withMembersRead(descriptor.properties, value);
    return value;
}

function withMembersRead(properties: readonly PropertyDescriptor[], value: unknown): unknown {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return value;
    const record = { ...(value as Record<string, unknown>) };
    for (const property of properties) {
        if (property.path in record) record[property.path] = withIconReferences(property, record[property.path]);
    }
    return record;
}
