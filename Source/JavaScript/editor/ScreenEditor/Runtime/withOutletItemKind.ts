// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletItemKind, PropertyValueType, type ComponentDescriptor, type PropertyDescriptor } from '@cratis/scene.model';

const kind: PropertyDescriptor = {
    path: 'kind',
    label: 'Kind',
    group: 'Content',
    valueType: PropertyValueType.Enum,
    default: OutletItemKind.Button,
    choices: Object.values(OutletItemKind).map(value => ({ value, label: value })),
};

// Every item of an outlet says what it is (`kind`: a button, a menu entry, a filter...), and Scene's upgrader writes it on the buttons of a toolbar it
// upgrades, but Scene 5.0.0's `core:outletItems` descriptor does not list it among the fields of its `items`, and it lists the item's `id` as a required
// field while Scene's collection check takes the id out before it checks the fields - so every edit of a toolbar's buttons would be refused. The descriptor is
// given `kind` and the id is the item's identity, not a field, here until Scene fixes both.
export function withOutletItemKind(descriptor: ComponentDescriptor): ComponentDescriptor {
    if (!descriptor.component.endsWith(':outletItems')) return descriptor;
    return {
        ...descriptor,
        properties: descriptor.properties.map(property => {
            const item = property.item;
            if (property.path !== 'items' || !item) return property;
            const fields = item.properties.filter(field => field.path !== 'id');
            return { ...property, item: { ...item, properties: fields.some(field => field.path === 'kind') ? fields : [kind, ...fields] } };
        }),
    };
}
