// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const SliderField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).SliderField }));

/**
 * The `Cratis.Components:sliderField` component - `SliderField` from `@cratis/components/CommandForm`.
 *
 * A numeric field where the range itself is the point - a percentage, a threshold, a weighting. Prefer
 * `numberField` whenever the exact value matters more than its position in a range; a slider trades
 * precision for a sense of scale, and that is only ever a deliberate choice.
 */
export function SceneSliderField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <SliderField
                    {...binding}
                    min={numberProperty(element.properties, 'min')}
                    max={numberProperty(element.properties, 'max')}
                    step={numberProperty(element.properties, 'step')}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
