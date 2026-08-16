// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { InputPassword } from 'primereact/inputpassword';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:password` component - a masked field, named `InputPassword` by PrimeReact 11.
 *
 * v11 pared this back to what a password field actually is: an input that renders as `type="password"`
 * until something flips `mask`. The v10 `feedback` strength meter and the `toggleMask` eye button are
 * both gone from the component - there is no prompt/weak/medium/strong panel and no built-in reveal
 * control to switch on - so neither property is read here. `mask` is exposed instead, which is the one
 * knob that survived and the one an authored screen can actually mean: a preview that starts revealed.
 * A screen that needs a reveal button now owns that button, because only the screen knows where it goes.
 */
export function PrimePassword({ element }: RegisteredComponentProps) {
    const [value, setValue] = useState(stringProperty(element, 'value', ''));
    return (
        <InputPassword
            data-scene-id={element.id}
            value={value}
            onValueChange={(event) => setValue(event.value ?? '')}
            mask={booleanProperty(element, 'mask', true)}
            placeholder={stringProperty(element, 'placeholder')}
            disabled={booleanProperty(element, 'disabled', false)}
        />
    );
}
