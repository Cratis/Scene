// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tag, TagSeverity } from '@cratis/components/Display';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The severities a screen may author for a tag, mapped to `@cratis/components`' vocabulary.
 *
 * `warning` (PrimeReact 10) and `error` are accepted spellings of `warn` and `danger`, so a screen written
 * against the PrimeReact `tag` keeps its color when this package wins the bare name. `help` has no
 * counterpart and, as in PrimeReact 11, degrades to the default styling.
 */
const severities: Record<string, TagSeverity> = {
    secondary: 'secondary',
    success: 'success',
    info: 'info',
    warn: 'warn',
    warning: 'warn',
    danger: 'danger',
    error: 'danger',
    contrast: 'contrast',
};

/**
 * The `Cratis.Components:tag` component - `Tag` from `@cratis/components/Display`, a small colored status label.
 *
 * Takes the same `value`, `severity`, `rounded` and `icon` properties as `PrimeReact:tag`, so the two are
 * interchangeable. The icon is a consumer-owned icon-font class, which `Tag` renders
 * itself as a decorative glyph beside the value.
 */
export function SceneTag({ element }: RegisteredComponentProps) {
    const severity = stringProperty(element.properties, 'severity');
    return (
        <Tag
            value={stringProperty(element.properties, 'value') ?? ''}
            severity={severity === undefined ? undefined : severities[severity]}
            rounded={booleanProperty(element.properties, 'rounded')}
            icon={stringProperty(element.properties, 'icon')}
        />
    );
}
