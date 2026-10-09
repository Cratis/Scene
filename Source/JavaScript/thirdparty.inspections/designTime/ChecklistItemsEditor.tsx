// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from '@cratis/scene.model';
import { DesignTimePropertyEditorProps } from '@cratis/scene.react';
import { ChecklistItem } from '../ChecklistItem';

/** A property editor for the checklist's items: one text box per item label, each change a canonical edit. */
export function ChecklistItemsEditor({ context, property, value }: DesignTimePropertyEditorProps) {
    const items = Array.isArray(value) ? value as ChecklistItem[] : [];
    const rename = (index: number, label: string) => context.submitEdits([{
        kind: SceneEditKind.SetProperty,
        nodeId: context.element.id,
        path: property.path,
        value: items.map((item, position) => position === index ? { ...item, label } : item),
    }]);

    return <fieldset aria-label={property.label}>
        {items.map((item, index) => <input key={item.id} aria-label={`${property.label} ${index + 1}`} value={item.label} onChange={event => rename(index, event.target.value)} />)}
    </fieldset>;
}
