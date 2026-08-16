// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { DatePicker } from 'primereact/datepicker';
import { InputText } from 'primereact/inputtext';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:calendar` component - a date picker, named `DatePicker` by PrimeReact 11.
 *
 * The seed value is parsed from an ISO date string because that is what survives a round trip through a
 * Scene model's JSON properties; an unparseable one leaves the field empty rather than showing
 * "Invalid Date".
 *
 * v11's `DatePicker` is a composition, and the grid is the bulk of it: `Calendar` holds a `Header` (the
 * month/year title flanked by the two navigation buttons) and a `Table` whose three `TableBody` views are
 * what makes clicking the title drill from days to months to years. That whole calendar is built once
 * here and then placed one of two ways, which is how `inline` survives a version that has no `inline`
 * prop: either inside a `Panel`, which simply renders where it stands, or behind a `Portal` and a
 * `Positioner`, which anchors it to the field and escapes any clipping ancestor.
 */
export function PrimeCalendar({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState<Date | undefined>(() => {
        const seed = stringProperty(element, 'value');
        if (seed === undefined) return undefined;
        const parsed = new Date(seed);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    });

    const inline = booleanProperty(element, 'inline', false);
    const showTime = booleanProperty(element, 'showTime', false);
    const calendar = (
        <>
            <DatePicker.Calendar>
                <DatePicker.Header>
                    <DatePicker.Prev>
                        <i className='pi pi-chevron-left' />
                    </DatePicker.Prev>
                    <DatePicker.Title>
                        <DatePicker.SelectMonth />
                        <DatePicker.SelectYear />
                        <DatePicker.Decade />
                    </DatePicker.Title>
                    <DatePicker.Next>
                        <i className='pi pi-chevron-right' />
                    </DatePicker.Next>
                </DatePicker.Header>
                <DatePicker.Table>
                    <DatePicker.TableHead />
                    <DatePicker.TableBody />
                    <DatePicker.TableBody view='month' />
                    <DatePicker.TableBody view='year' />
                </DatePicker.Table>
            </DatePicker.Calendar>
            {showTime && <DatePicker.Time />}
        </>
    );

    return (
        <DatePicker.Root
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(event.value instanceof Date ? event.value : undefined)}
            dateFormat={stringProperty(element, 'dateFormat')}
            showTime={showTime}
            disabled={booleanProperty(element, 'disabled', false)}>
            {inline ? (
                <DatePicker.Panel>{calendar}</DatePicker.Panel>
            ) : (
                <>
                    <DatePicker.Input as={InputText} placeholder={stringProperty(element, 'placeholder')} />
                    {booleanProperty(element, 'showIcon', true) && (
                        <DatePicker.Trigger>
                            <i className='pi pi-calendar' />
                        </DatePicker.Trigger>
                    )}
                    <DatePicker.Portal>
                        <DatePicker.Positioner align='start'>
                            <DatePicker.Popup>{calendar}</DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </>
            )}
        </DatePicker.Root>
    );
}
