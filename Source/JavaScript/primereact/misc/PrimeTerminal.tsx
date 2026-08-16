// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Terminal } from 'primereact/terminal';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:terminal` component - a command-line surface.
 *
 * Terminal accepts input and waits for something to answer. Nothing in this package answers, because
 * responding to a command is application behavior and a Scene element cannot express it. The component
 * therefore echoes what is typed and prints nothing back until the hosting application supplies an
 * answer - which is the honest shape of a terminal with no backend, not a broken one.
 *
 * PrimeReact 11 changed how that answer arrives: v10 published commands on a global `TerminalService`
 * that any listener could subscribe to, and v11 takes an `onCommand` callback on the component instead.
 * That is a real improvement for an application - the wiring is local and typed rather than a global
 * channel keyed by nothing - but it is also why the gap cannot be closed here: a callback has to come from
 * whoever mounts the screen, and the adapter only has the element.
 *
 * `CommandList` and `Prompt` render themselves from the component's own state when given no children, so
 * the composition is just naming the three regions a terminal has.
 */
export function PrimeTerminal({ element }: RegisteredComponentProps) {
    return (
        <Terminal.Root data-scene-id={element.id} prompt={stringProperty(element, 'prompt', '$')}>
            <Terminal.Welcome>{stringProperty(element, 'welcomeMessage', 'Welcome')}</Terminal.Welcome>
            <Terminal.CommandList />
            <Terminal.Prompt />
        </Terminal.Root>
    );
}
