// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';
import { PrimeReactProvider } from '@primereact/core';
import { CratisComponentsProvider } from '@cratis/components/Common';

// The stylesheet layers a page in this blueprint needs, in the order they resolve. Components 4 owns its
// own CSS outright and keeps it out of the JavaScript module graph, so every sheet below is an explicit
// import rather than something a bundler injects behind an `import './Foo.css'`.
//
// `tokens` defines the `--cratis-*` layer, `styles` is every component stylesheet plus the Tailwind
// utilities that consume it, and `theme` is the Cratis-authored MIT baseline that assigns those tokens
// actual values. That order matters: the last two both read the first.
//
// The Scene package's bridge puts Scene's `--scene-*` tokens in front of that, and the default blueprint's
// `layout.css` draws the shell every one of these pages sits inside - which is the sheet this package does
// not have and does not want, because the shell is not its.
//
// The last two are reached by relative path rather than through their packages' `./styles` export,
// because `main.ts` aliases those package names to their sources and a Vite string alias matches by
// prefix - `@cratis/scene.components/styles` would be rewritten into a path inside `index.ts`.
import '@cratis/components/tokens';
import '@cratis/components/styles';
import '@cratis/components/theme';
import 'primeicons/primeicons.css';
import '../../components/theme/sceneTokenBridge.css';
import '../../blueprint.default/shell/layout.css';

// The baseline theme is scoped to a `cratis-theme` ancestor rather than to `:root`, so something has to
// carry the class, and overlays portal to the body rather than into the story's subtree.
document.body.classList.add('cratis-theme');

/**
 * Two providers, because these pages are two things at once.
 *
 * The page bodies are Components 4, which owns its own markup and configuration and no longer sits on
 * PrimeReact at all - `CratisComponentsProvider` now carries only what the library itself owns.
 *
 * The shell they sit inside is the default blueprint's, and that reaches for PrimeReact directly in five
 * places (`Topbar`, `Sidebar`, `Breadcrumb`, `UserMenu`, `ConfigPanel`). Every PrimeReact 11 component
 * resolves its configuration, theme and z-index registry through `PrimeReactProvider` and throws without
 * one. Until Components 3 that provider came for free, because `CratisComponentsProvider` wrapped it;
 * under Components 4 it does not, so this preview supplies it explicitly. Dropping it would not degrade
 * these stories - it would stop them rendering.
 */
const preview: Preview = {
    decorators: [
        Story => (
            <PrimeReactProvider>
                <CratisComponentsProvider value={{ locale: 'en-US' }}>
                    <Story />
                </CratisComponentsProvider>
            </PrimeReactProvider>
        ),
    ],
    parameters: {
        controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    },
};

export default preview;
