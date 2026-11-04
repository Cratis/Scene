// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProgressBar } from '@cratis/components/Display';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, stringProperty } from '../properties';

/**
 * The `Cratis.Components:progressBar` component - `ProgressBar` from `@cratis/components/Display`.
 *
 * As in `PrimeReact:progressBar`, the mode follows whether a `value` was given: progress that cannot be
 * measured is indeterminate rather than stuck at zero. The element's `label` is the bar's accessible name,
 * `Progress` when it says nothing, because a bar announced as just "progress bar" tells nobody what is progressing.
 */
export function SceneProgressBar({ element }: RegisteredComponentProps) {
    const value = numberProperty(element.properties, 'value');
    return (
        <ProgressBar
            value={value}
            mode={value === undefined ? 'indeterminate' : 'determinate'}
            showValue={booleanProperty(element.properties, 'showValue')}
            aria-label={stringProperty(element.properties, 'label') ?? 'Progress'}
        />
    );
}
