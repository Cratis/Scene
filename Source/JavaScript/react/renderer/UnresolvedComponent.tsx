// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from './ComponentRegistry';

/**
 * The fallback rendered for an {@link ExternalComponent} whose `componentName` is not in the active
 * {@link ComponentRegistry} - a visibly broken placeholder, never a silent blank, since a missing
 * component is a real configuration gap the renderer should surface, not hide.
 */
export function UnresolvedComponent({ element }: RegisteredComponentProps) {
    return (
        <div
            data-scene-unresolved-component={element.componentName}
            style={{ border: '1px dashed red', color: 'red', padding: '0.25rem 0.5rem', fontFamily: 'monospace' }}
        >
            Unresolved component: {element.componentName}
        </div>
    );
}
