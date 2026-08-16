// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';
import { PrimeReactProvider } from '@primereact/core';
import Lara from '@primeuix/themes/lara';

// PrimeReact 11 ships zero CSS - there is no `primereact/resources` directory to import a base sheet or a
// theme from any more. A look is a preset: a plain JavaScript token object that `@primeuix/styled` turns
// into `--p-*` custom properties at runtime when the provider is handed one. Lara is the same family this
// preview used to load as `lara-light-indigo`, so the stories keep the look they were written against.
//
// `primeicons` is still a stylesheet, and the shell's own sheet still layers on top of both. Loading them
// here rather than from a story keeps every story looking the same and matches what a host does once, at
// its entry point.
import 'primeicons/primeicons.css';
import '../shell/layout.css';

/**
 * Every story renders inside `PrimeReactProvider`, because PrimeReact 11 requires it: each component
 * resolves its configuration, theme and z-index registry through that context and throws without one. The
 * shell reaches for PrimeReact in five places - the topbar toggle, the sidebar pin, the user menu, the
 * breadcrumb and the configurator's drawer - so this is not optional decoration, it is what makes the
 * stories render at all.
 *
 * No `license` is supplied here: PrimeReact 11 is commercially licensed and its provider verifies a key on
 * mount, so a preview without one logs a warning and shows PrimeTek's banner. That is the honest state of
 * an unlicensed development preview rather than something to hide - a host supplies its own key through
 * the same prop.
 */
const preview: Preview = {
    decorators: [
        Story => (
            <PrimeReactProvider theme={{ preset: Lara }}>
                <Story />
            </PrimeReactProvider>
        ),
    ],
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
