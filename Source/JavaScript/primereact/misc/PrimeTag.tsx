// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tag } from 'primereact/tag';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:tag` component - a colored status label, the read-only counterpart to a chip.
 *
 * PrimeReact 11 dropped the `value` and `icon` props; a tag renders its children now. The icon is marked
 * decorative because the value beside it already carries the meaning - a screen reader announcing
 * "check-circle Published" would be reading the styling out loud.
 *
 * The v10 severity `warning` is translated to v11's `warn` rather than passed through, so a screen
 * authored against the old vocabulary keeps its color instead of quietly rendering in the default one.
 */
export function PrimeTag({ element }: RegisteredComponentProps) {
    const icon = stringProperty(element, 'icon');
    const severity = stringProperty(element, 'severity');
    return (
        <Tag
            data-scene-id={element.id}
            severity={(severity === 'warning' ? 'warn' : severity) as 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined}
            rounded={booleanProperty(element, 'rounded', false)}>
            {icon !== undefined && <i className={icon} aria-hidden='true' />}
            {stringProperty(element, 'value', '')}
        </Tag>
    );
}
