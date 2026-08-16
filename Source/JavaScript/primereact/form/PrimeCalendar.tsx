// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Calendar } from 'primereact/calendar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:calendar` component - a date picker.
 *
 * The seed value is parsed from an ISO date string because that is what survives a round trip through a
 * Scene model's JSON properties; an unparseable one leaves the field empty rather than showing
 * "Invalid Date".
 *
 * In PrimeReact 11 this component is renamed `DatePicker`.
 */
export function PrimeCalendar({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<Date | undefined>(() => {
        const seed = stringProperty(element, 'value');
        if (seed === undefined) return undefined;
        const parsed = new Date(seed);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    });

    return (
        <Calendar
            data-scene-id={element.id}
            value={value}
            onChange={(event) => setValue(event.value instanceof Date ? event.value : undefined)}
            dateFormat={stringProperty(element, 'dateFormat')}
            showIcon={booleanProperty(element, 'showIcon', true)}
            showTime={booleanProperty(element, 'showTime', false)}
            inline={booleanProperty(element, 'inline', false)}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
