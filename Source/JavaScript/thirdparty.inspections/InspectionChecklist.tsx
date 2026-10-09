// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { ChecklistItem } from './ChecklistItem';

/**
 * The runtime component: a titled list of checkboxes, one per item. It is all a runtime host loads from this
 * package - nothing here imports design-time code.
 */
export function InspectionChecklist({ element }: RegisteredComponentProps) {
    const title = typeof element.properties.title === 'string' ? element.properties.title : 'Inspection';
    const items = Array.isArray(element.properties.items) ? (element.properties.items as ChecklistItem[]) : [];
    return <fieldset data-acme-checklist={element.id}>
        <legend>{title}</legend>
        {items.map(item => <label key={item.id}><input type='checkbox' required={item.required} />{item.label}</label>)}
    </fieldset>;
}
