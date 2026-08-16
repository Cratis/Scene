// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';
import { CratisComponentsProvider } from '@cratis/components/Common';

// The stylesheet layers a page in this blueprint needs, in the order they resolve. PrimeReact 11 ships
// zero CSS - `primereact/resources/themes/*` does not exist any more - and `@cratis/components` 3.0.0 took
// its own CSS out of the JavaScript module graph, so every sheet below is an explicit import rather than
// something a bundler injects behind an `import './Foo.css'`.
//
// `tokens` defines the `--cratis-*` layer, `styles` is every component stylesheet plus the Tailwind
// utilities that consume it, and `theme` is the Cratis-authored MIT baseline that assigns those tokens
// actual values. That order matters: the last two both read the first. `theme` is what gives this preview
// a look at all, because with no `@primeuix/themes` preset there are no `--p-*` values for the tokens to
// resolve to - which also means the raw PrimeReact widgets the default blueprint's shell renders come out
// structural rather than styled. That is the honest picture of an unstyled-first host, and this package
// takes no dependency on a preset to paper over it.
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

/**
 * Every story renders inside `CratisComponentsProvider`, the library's own configuration provider over
 * PrimeReact's. Without it the wrapped components fall back to PrimeReact's defaults rather than Cratis',
 * so a story would show something subtly different from what an application renders - which defeats the
 * point of having stories at all.
 *
 * On PrimeReact 11 it is also load-bearing rather than merely advisable: every v11 component resolves its
 * configuration, theme and z-index registry through `PrimeReactProvider`, which this wraps, and throws
 * outright without one. These pages sit inside the default blueprint's shell, which reaches for PrimeReact
 * directly in five places, so removing this decorator would not degrade the stories - it would stop them
 * rendering.
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
