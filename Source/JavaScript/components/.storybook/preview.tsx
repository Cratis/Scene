// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';
import { CratisComponentsProvider } from '@cratis/components/Common';

// The stylesheet stack a `@cratis/components` component needs, in the order the layers resolve.
//
// PrimeReact 11 ships no CSS whatsoever - `primereact/resources/` does not exist, so the compiled theme
// this file used to import has nothing left to resolve to. A look is no longer a stylesheet at all: it is
// either a `@primeuix/themes` preset handed to the provider, which `@primeuix/styled` turns into `--p-*`
// custom properties at runtime, or a sheet that assigns the library's own `--cratis-*` tokens directly.
// This preview takes the second path - see the decorator below for why.
//
// `tokens` declares the `--cratis-*` layer every component stylesheet reads, `styles` is that component
// CSS plus the compiled Tailwind utilities and the vendored Allotment sheet `DataPage`'s split view needs,
// `theme` fills the tokens in, and this package's bridge puts Scene's `--scene-*` tokens in front of all
// of it wherever a Scene theme is applied. Each layer consumes the one before it, so the order is not
// cosmetic.
import '@cratis/components/tokens';
import '@cratis/components/styles';
import '@cratis/components/theme';
import 'primeicons/primeicons.css';
import '../theme/sceneTokenBridge.css';

// The baseline theme is scoped to a `cratis-theme` ancestor rather than to `:root`, so something has to
// carry the class. `<body>` rather than a wrapper inside each story, because PrimeReact 11 portals its
// overlays - dialogs, select panels, the filter panel - straight to `document.body`; a wrapper would
// leave every one of them outside the themed subtree and rendering unstyled.
document.body.classList.add('cratis-theme');

/**
 * Every story renders inside `CratisComponentsProvider`, the library's own configuration provider over
 * PrimeReact's. Without it the wrapped components fall back to PrimeReact's defaults rather than
 * Cratis', so a story would be showing something subtly different from what an application renders -
 * which defeats the point of having stories at all.
 *
 * `unstyled` is the posture the imported `@cratis/components/theme` is written for: it is Cratis-authored
 * MIT CSS that assigns the `--cratis-*` tokens outright, so it needs neither a `@primeuix/themes` preset
 * nor the PrimeUI license key a styled preset is gated behind. Choosing it over a preset also keeps this
 * package's dependency surface honest - `@primeuix/themes` is not one of its dependencies, and a preview
 * is the wrong place to start relying on a package nobody declared.
 *
 * It is the right choice for these stories on its own terms too. The `--cratis-*` token layer is exactly
 * what `theme/sceneTokenBridge.css` overrides, so a Scene theme visibly takes over from the baseline in
 * the `Themed` story rather than from a preset's `--p-*` values one level further down the chain.
 */
const preview: Preview = {
    decorators: [
        Story => (
            <CratisComponentsProvider value={{ unstyled: true }}>
                <Story />
            </CratisComponentsProvider>
        ),
    ],
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
