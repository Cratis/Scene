// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';

/**
 * Keeps a locally editable copy of a value a screen declares, resetting it whenever the declared value
 * itself changes.
 *
 * The editors in `@cratis/components` are controlled components: `ObjectContentEditor`, `SchemaEditor`
 * and `TimeMachine` all render what they are given and report changes through a callback. A Scene screen
 * can only *declare* the starting value - a property bag has no way to receive a callback - so without
 * somewhere to put the result, every one of these would render as a dead surface that discards every
 * keystroke. Local state is what makes them behave like the editors they are while a screen is being
 * designed; a host that needs the edits for real reads them off its own model, not off the screen.
 *
 * The reset is deliberately done during render rather than in an effect: Studio rewrites an element's
 * properties as the designer types, and an effect-based reset would show one frame of the previous
 * value every time.
 */
export function useEditableCopy<T>(source: T): [T, (value: T) => void] {
    const [edited, setEdited] = useState(source);
    const [lastSource, setLastSource] = useState(source);

    if (lastSource !== source) {
        setLastSource(source);
        setEdited(source);
        return [source, setEdited];
    }

    return [edited, setEdited];
}
