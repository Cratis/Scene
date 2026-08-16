// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';
import { CratisComponentsProvider } from '@cratis/components/Common';

// The three layers a `@cratis/components` component needs to look like itself, in the order they
// resolve. PrimeReact 10 ships every widget's *structural* CSS inside the theme file - there is no
// separate primitives stylesheet - so without a theme the wrapped widgets render as bare HTML. The
// library's own sheet adds its Tailwind utilities and the `--cratis-*` token layer on top, and this
// package's bridge puts Scene's `--scene-*` tokens in front of that wherever a Scene theme is applied.
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import '@cratis/components/styles';
import '../theme/sceneTokenBridge.css';

/**
 * Every story renders inside `CratisComponentsProvider`, the library's own configuration provider over
 * PrimeReact's. Without it the wrapped components fall back to PrimeReact's defaults rather than
 * Cratis', so a story would be showing something subtly different from what an application renders -
 * which defeats the point of having stories at all.
 */
const preview: Preview = {
    decorators: [
        Story => (
            <CratisComponentsProvider>
                <Story />
            </CratisComponentsProvider>
        ),
    ],
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
