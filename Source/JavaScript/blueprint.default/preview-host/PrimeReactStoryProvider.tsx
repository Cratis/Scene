// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropsWithChildren } from 'react';
import { PrimeReactProvider } from '@primereact/core';
import Lara from '@primeuix/themes/lara';
// The icon font is a stylesheet with no type declarations, and a `.d.ts` shim would be gitignored.
// @ts-ignore
import 'primeicons/primeicons.css';
// The Scene token bridge for PrimeReact, as Stage and the primereact workspace load it, and that workspace's stand-in for the few
// Tailwind utilities the wrappers use (a real profile gets them from the Tailwind package; Storybook has no such host).
// @ts-ignore
import '@cratis/scene.primereact/primeReactTheme.css';
// @ts-ignore
import '../../primereact/.storybook/preview.css';

// The key comes from the same PRIMEUI_LICENSE secret Stage and Studio build with (see .storybook/main.ts). It is never
// committed; without one PrimeReact shows its own "Invalid PrimeUI License" banner, which is its honest unlicensed state.
const license = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.SCENE_PRIMEUI_LICENSE || '';

/**
 * The provider a story needs when its profile lists PrimeReact: the licence key, a Lara preset (PrimeReact 11 ships no CSS, a
 * look only exists once a preset reaches the provider) and the icon font. Only stories import it. Stories that render the default blueprint alone
 * never import this, so nothing PrimeReact loads for them.
 */
export function PrimeReactStoryProvider({ children }: PropsWithChildren) {
    return <PrimeReactProvider license={license} theme={{ preset: Lara }}>{children}</PrimeReactProvider>;
}
