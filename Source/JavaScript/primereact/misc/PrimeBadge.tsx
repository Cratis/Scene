// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Badge } from 'primereact/badge';
import { RegisteredComponentProps } from '@cratis/scene.react';
import {severityProperty, stringProperty} from '../properties';

/**
 * The `PrimeReact:badge` component - a small count or status marker.
 *
 * PrimeReact 11 dropped the `value` prop in favor of children, which is why the authored value is placed
 * inside the element rather than passed to it. The badge keeps rendering with no value at all - v11 marks
 * that case `data-empty` and styles it as the bare dot a "there is something here" indicator wants.
 *
 * Two vocabulary changes are absorbed here rather than pushed onto screens. `warning` became `warn`, so a
 * screen written against PrimeReact 10 keeps its color instead of silently falling back to the default.
 * The `normal` size, on the other hand, is simply gone: v11 sizes are `small`, `large` and `xlarge`, and
 * the unsized badge *is* the normal one, so nothing needs translating.
 */
export function PrimeBadge({ element }: RegisteredComponentProps) {
    // Tag and Badge are the two components PrimeReact 11 gives no `help` variant, so an authored
    // `help` degrades to the default styling rather than failing to compile.
    const severity = severityProperty(element, 'severity');
    return (
        <Badge
            data-scene-id={element.id}
            severity={severity === 'help' ? undefined : severity}
            size={stringProperty(element, 'size') as 'small' | 'large' | 'xlarge' | undefined}>
            {stringProperty(element, 'value', '')}
        </Badge>
    );
}
