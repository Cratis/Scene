// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Terminal } from 'primereact/terminal';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `PrimeReact:terminal` component - a command-line surface.
 *
 * Terminal publishes typed commands on `TerminalService` and waits for something to answer. Nothing in
 * this package answers, because responding to a command is application behavior and a Scene element
 * cannot express it. The component therefore accepts input and prints nothing back until the hosting
 * application subscribes - which is the honest shape of a terminal with no backend, not a broken one.
 */
export function PrimeTerminal({ element }: RegisteredComponentProps) {
    return (
        <Terminal
            data-scene-id={element.id}
            welcomeMessage={stringProperty(element, 'welcomeMessage', 'Welcome')}
            prompt={stringProperty(element, 'prompt', '$')}
        />
    );
}
