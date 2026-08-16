// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const TextAreaField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).TextAreaField }));

/**
 * The `Cratis.Components:textAreaField` component - `TextAreaField` from `@cratis/components/CommandForm`.
 *
 * The multi-line counterpart to `inputTextField`. A separate name rather than a `multiline` flag on that
 * one, because the two wrap different PrimeReact inputs and take different sizing props - collapsing
 * them would mean a `rows` property that is meaningless half the time.
 */
export function SceneTextAreaField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <TextAreaField
                    {...binding}
                    placeholder={stringProperty(element.properties, 'placeholder')}
                    rows={numberProperty(element.properties, 'rows')}
                    cols={numberProperty(element.properties, 'cols')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
