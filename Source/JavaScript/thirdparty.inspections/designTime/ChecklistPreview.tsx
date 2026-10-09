// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeComponentProps } from '@cratis/scene.react';

/** A design-time preview: what the checklist will look like, with sample items when none are authored yet. */
export function ChecklistPreview({ context }: DesignTimeComponentProps) {
    const items = Array.isArray(context.element.properties.items) ? context.element.properties.items as { label: string }[] : [{ label: 'Sample item' }];
    return <ul aria-label='Checklist preview'>{items.map((item, index) => <li key={index}>☐ {item.label}</li>)}</ul>;
}
