// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Decorator, Preview } from '@storybook/react';
import { PrimeReactProvider } from '@primereact/core';
import { primeReactTheme, usePrimeReactTheme } from '../theme';
import '../primeReactTheme.css';
import './preview.css';

// PrimeReact 11 ships no CSS at all - there is no `primereact/resources` directory any more, so the two
// stylesheet imports that used to sit here (the compiled theme and the structural sheet) have nothing to
// resolve to. Only the icon font is still a stylesheet.
import 'primeicons/primeicons.css';

/**
 * Puts every story inside a `PrimeReactProvider` carrying a real Scene theme.
 *
 * This is the v11 replacement for importing a compiled theme stylesheet, and it is not merely a
 * different way to spell the same thing: in v11 a look *only* exists once a preset has reached the
 * provider, because that is what makes `@primeuix/styled` emit the `--p-*` custom properties every
 * component reads. A story rendered outside a provider is not "unthemed", it is unstyled.
 *
 * Going through `usePrimeReactTheme` rather than importing a preset directly means the stories exercise
 * the same path an application does, so a break in Scene's own theme resolution shows up here rather
 * than only in an application that consumes the package.
 */
const withTheme: Decorator = (Story) => {
    const configuration = usePrimeReactTheme(primeReactTheme('lara-light-blue'));

    return (
        <PrimeReactProvider value={configuration}>
            <Story />
        </PrimeReactProvider>
    );
};

const preview: Preview = {
    decorators: [withTheme],
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
