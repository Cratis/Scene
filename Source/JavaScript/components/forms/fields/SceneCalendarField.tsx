// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty, unionProperty } from '../../properties';
import { CommandFormField } from './CommandFormField';

const CalendarField = lazy(async () => ({ default: (await import('@cratis/components/CommandForm')).CalendarField }));

/** Whether times are shown on a 12- or 24-hour clock. */
const hourFormats = ['12', '24'] as const;

/**
 * The `Cratis.Components:calendarField` component - `CalendarField` from `@cratis/components/CommandForm`.
 *
 * Binds to a `Date` property, so the command receives a real date rather than the string an
 * `<input type="date">` produces - which matters because the backend's command record is typed and a
 * string would fail model binding rather than the field.
 *
 * `minDate` and `maxDate` are deliberately not exposed: they would have to come out of the property bag
 * as strings and be parsed here, and a bound range that silently misparses is worse than no bound range.
 * A date range that has to be enforced belongs in the command's validator, where it is authoritative.
 */
export function SceneCalendarField({ element }: RegisteredComponentProps) {
    return (
        <CommandFormField element={element}>
            {binding => (
                <CalendarField
                    {...binding}
                    placeholder={stringProperty(element.properties, 'placeholder')}
                    dateFormat={stringProperty(element.properties, 'dateFormat')}
                    showIcon={booleanProperty(element.properties, 'showIcon')}
                    showTime={booleanProperty(element.properties, 'showTime')}
                    hourFormat={unionProperty(element.properties, 'hourFormat', hourFormats)}
                    className={stringProperty(element.properties, 'className')}
                />
            )}
        </CommandFormField>
    );
}
