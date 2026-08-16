// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, stringProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const ChipsField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).ChipsField }));

/**
 * The `Cratis.Components:chipsField` component - `ChipsField` from `@cratis/components/CommandForm`.
 *
 * A free-form list of strings - tags, labels, recipients - where the values are typed rather than picked.
 * `multiSelectField` is the right choice whenever the values come from a known set; this one exists for
 * when they do not.
 */
export function SceneChipsField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <ChipsField
                    {...binding}
                    placeholder={stringProperty(element.properties, 'placeholder')}
                    max={numberProperty(element.properties, 'max')}
                    separator={stringProperty(element.properties, 'separator')}
                    addOnBlur={booleanProperty(element.properties, 'addOnBlur')}
                    allowDuplicate={booleanProperty(element.properties, 'allowDuplicate')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
