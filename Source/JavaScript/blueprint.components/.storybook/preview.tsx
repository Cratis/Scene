// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Preview } from '@storybook/react';
import { CratisComponentsProvider } from '@cratis/components/Common';

// The stylesheet layers a page in this blueprint needs, in the order they resolve. PrimeReact 10 ships
// every widget's *structural* CSS inside its theme file, so without a theme the wrapped widgets render as
// bare HTML. `@cratis/components`' own sheet adds its Tailwind utilities and the `--cratis-*` token layer,
// the Scene package's bridge puts Scene's `--scene-*` tokens in front of that, and the default blueprint's
// `layout.css` draws the shell every one of these pages sits inside - which is the sheet this package does
// not have and does not want, because the shell is not its.
//
// The last two are reached by relative path rather than through their packages' `./styles` export,
// because `main.ts` aliases those package names to their sources and a Vite string alias matches by
// prefix - `@cratis/scene.components/styles` would be rewritten into a path inside `index.ts`.
import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import '@cratis/components/styles';
import '../../components/theme/sceneTokenBridge.css';
import '../../blueprint.default/shell/layout.css';

/**
 * Every story renders inside `CratisComponentsProvider`, the library's own configuration provider over
 * PrimeReact's. Without it the wrapped components fall back to PrimeReact's defaults rather than Cratis',
 * so a story would show something subtly different from what an application renders - which defeats the
 * point of having stories at all.
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
