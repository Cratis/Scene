// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';
import { CratisComponentsProvider } from '@cratis/components/Common';

// The stylesheet stack a `@cratis/components` component needs, in the order the layers resolve.
//
// Components 4 owns its own markup and styling outright - there is no PrimeReact underneath it any more,
// and so no preset and no `--p-*` values behind the tokens. A look is one thing now: a sheet that assigns
// the library's own `--cratis-*` tokens.
//
// `tokens` declares the `--cratis-*` layer every component stylesheet reads, `styles` is that component
// CSS plus the compiled Tailwind utilities and the vendored Allotment sheet `DataPage`'s split view needs,
// `theme` fills the tokens in, and this package's bridge puts Scene's `--scene-*` tokens in front of all
// of it wherever a Scene theme is applied. Each layer consumes the one before it, so the order is not
// cosmetic.
import '@cratis/components/tokens';
import '@cratis/components/styles';
import '@cratis/components/theme';
// Components 4 renders an `Icon` given a string as `<i className={icon} />` - a consumer-owned icon font,
// whichever one the consumer happens to load. These stories demonstrate that with `pi pi-*`, so the
// preview loads primeicons to make them visible. It is a Storybook devDependency for exactly this reason
// and nothing in the package's own source reaches for it.
import 'primeicons/primeicons.css';
import '../theme/sceneTokenBridge.css';

// The baseline theme is scoped to a `cratis-theme` ancestor rather than to `:root`, so something has to
// carry the class. `<body>` rather than a wrapper inside each story, because overlays - dialogs, select
// panels, the filter panel - are portaled to `document.body`; a wrapper would leave every one of them
// outside the themed subtree and rendering unstyled.
document.body.classList.add('cratis-theme');

/**
 * Every story renders inside `CratisComponentsProvider`, so a story shows what an application shows.
 *
 * Components 4 narrowed the provider to configuration the library itself owns - `locale` and `messages`.
 * The renderer keys it used to carry (`license`, `theme`, `defaults`, `pt`, `ripple`, `unstyled`) existed
 * to configure PrimeReact underneath, and there is no PrimeReact underneath any more. `unstyled` in
 * particular is gone rather than defaulted: the imported `@cratis/components/theme` is the look now, and
 * `theme/sceneTokenBridge.css` overrides its `--cratis-*` tokens directly, which is what lets the `Themed`
 * story visibly take over from the baseline.
 */
const preview: Preview = {
    decorators: [
        Story => (
            <CratisComponentsProvider value={{ locale: 'en-US' }}>
                <Story />
            </CratisComponentsProvider>
        ),
    ],
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
