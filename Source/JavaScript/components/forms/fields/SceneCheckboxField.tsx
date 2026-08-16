// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const CheckboxField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).CheckboxField }));

/**
 * The `Cratis.Components:checkboxField` component - `CheckboxField` from `@cratis/components/CommandForm`.
 *
 * `label` is the text beside the box and is distinct from `title`, which is the field's own label above
 * it - a checkbox usually wants only one of the two, and which one is a layout decision the screen makes.
 */
export function SceneCheckboxField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <CheckboxField
                    {...binding}
                    label={stringProperty(element.properties, 'label')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
