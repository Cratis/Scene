// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const ColorPickerField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).ColorPickerField }));

/**
 * The `Cratis.Components:colorPickerField` component - `ColorPickerField` from
 * `@cratis/components/CommandForm`.
 *
 * Binds a color to a string property. `inline` decides whether the picker is always open or opens from a
 * swatch, which is a layout decision rather than a behavioral one.
 */
export function SceneColorPickerField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <ColorPickerField
                    {...binding}
                    inline={booleanProperty(element.properties, 'inline')}
                    defaultColor={stringProperty(element.properties, 'defaultColor')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
