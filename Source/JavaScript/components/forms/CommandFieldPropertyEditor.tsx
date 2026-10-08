// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from '@cratis/scene.model';
import { DesignTimePropertyEditorProps } from '@cratis/scene.react';

/**
 * Package-side editor for a command form property. It writes through the generic Scene edit boundary.
 */
export function CommandFieldPropertyEditor({ context, property, value, setValue }: DesignTimePropertyEditorProps) {
    return <input aria-label={property.label} value={typeof value === 'string' ? value : ''} onChange={event => {
        const next = event.currentTarget.value;
        setValue(next);
        context.submitEdits([{ kind: SceneEditKind.SetProperty, nodeId: context.element.id, path: property.path, value: next }]);
    }} />;
}
