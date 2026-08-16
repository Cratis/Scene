// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { InputColor, parseColor } from 'primereact/inputcolor';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The color an unauthored - or unparseable - picker falls back to, so an element with no `value` and an
 * element with a broken one look alike rather than one of them looking broken.
 */
const fallbackColor = '6366f1';

/**
 * Parses a hex string with no leading `#` into the color object PrimeReact 11 works in.
 *
 * A Scene element's properties are authored, not validated: `value: 'red'` or a half-typed hex is an
 * ordinary state on a screen under construction, and `parseColor` throws on both. Swallowing that here
 * renders a picker the author can immediately correct instead of taking the surrounding screen down -
 * and it lives in a function rather than inline because a `try` inside JSX would force the whole
 * composition into a statement body for one expression's sake.
 *
 * @param hex The authored hex digits, without a leading `#`.
 * @returns The parsed color, or {@link fallbackColor} when the string is not a color.
 */
function toColor(hex: string) {
    try {
        return parseColor(`#${hex}`);
    } catch {
        return parseColor(`#${fallbackColor}`);
    }
}

/**
 * The `PrimeReact:colorPicker` component, named `InputColor` by PrimeReact 11.
 *
 * The value is kept as a hex string without the leading `#`, which is what a Scene model round-trips
 * cleanly and what the v10 component expected; a screen writing `#6366f1` therefore still works. v11
 * models its value as a parsed color object rather than a string, so this adapter is the translation
 * layer - {@link toColor} on the way in, `toString('hex')` on the way out - and the authored property
 * keeps the shape it always had.
 *
 * v10's `inline` property is not read. It chose between a swatch that opened a panel and the panel shown
 * in place; v11's `InputColor` is only ever the panel - saturation area, hue slider and swatch, with no
 * overlay mode to switch to - so there is no longer a choice to express.
 */
export function PrimeColorPicker({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(stringProperty(element, 'value', fallbackColor).replace('#', ''));
    return (
        <div data-scene-id={element.id}>
            <InputColor.Root
                value={toColor(value)}
                onValueChange={(event) => setValue(event.value.toString('hex').replace('#', ''))}
                disabled={booleanProperty(element, 'disabled', false)}>
                <InputColor.Area>
                    <InputColor.AreaBackground />
                    <InputColor.AreaHandle />
                </InputColor.Area>
                <InputColor.Slider>
                    <InputColor.SliderTrack />
                    <InputColor.SliderHandle />
                </InputColor.Slider>
                <InputColor.Swatch>
                    <InputColor.SwatchBackground />
                </InputColor.Swatch>
            </InputColor.Root>
        </div>
    );
}
