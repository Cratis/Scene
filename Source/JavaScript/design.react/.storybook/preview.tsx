// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';
import { PrimeReactProvider } from '@primereact/core';
import { CratisComponentsProvider } from '@cratis/components/Common';

// The editor draws with the host's Cratis Components custom properties, so a story needs the layers a host has, in the order
// they resolve: `tokens` defines the `--cratis-*` layer, `styles` is every component stylesheet and `theme` is the Cratis-authored
// baseline that gives those tokens their values.
import '@cratis/components/tokens';
import '@cratis/components/styles';
import '@cratis/components/theme';
import 'primeicons/primeicons.css';

// The baseline theme is scoped to a `cratis-theme` ancestor rather than to `:root`, so something has to carry the class.
document.body.classList.add('cratis-theme');

// A host sets the font of its page; a story is the page, and a browser's default is a serif that nothing in the canvas was drawn against.
document.body.style.fontFamily = 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const preview: Preview = {
    decorators: [
        Story => (
            <PrimeReactProvider>
                <CratisComponentsProvider value={{ locale: 'en-US' }}>
                    <div style={{ height: '100vh' }}>
                        <Story />
                    </div>
                </CratisComponentsProvider>
            </PrimeReactProvider>
        ),
    ],
    parameters: {
        layout: 'fullscreen',
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
