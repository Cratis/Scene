// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PrimeReactProvider } from '@primereact/core/config';
import { primeReactThemes, usePrimeReactTheme } from '@cratis/scene.primereact';
import { mergeComponentDefaults } from './mergeComponentDefaults';
import { screenEditorPrimeReactDefaults } from './screenEditorPrimeReactDefaults';

// Everything PrimeReact's own provider takes - the license key, the theme, the locale, pass-through options - because the
// host owns those, not the editor.
export type ScreenEditorPrimeReactProviderProps = NonNullable<Parameters<typeof PrimeReactProvider>[0]>;

// The preset a host that chooses none gets: a Scene theme Play knows, so the components are drawn with tokens and not with nothing.
const fallbackTheme = primeReactThemes.find(theme => theme.name === 'lara-light-blue') ?? primeReactThemes[0];

// PrimeReact's own provider, re-exported by name so a host does not have to know which PrimeReact package the editor
// resolves it from. It is deliberately not a second context: it renders the one provider from `@primereact/core`, which the
// published bundle leaves as an import for the host to resolve, so there is exactly one PrimeReact context in the page.
//
// It also hands the provider what a screen needs to look as it does in Play, which PrimeReact 11 does not do on its own: the component
// styles (`screenEditorPrimeReactDefaults`), because its primitives ship as structure with no look, and - only when the host gave no
// theme - a Scene theme preset, because those styles read the `--p-*` tokens a preset emits. A host that has its own theme passes it and it
// is used as given; a host that wants other defaults passes `defaults`, which are merged into the editor's component by component and part by part, so a host
// entry for a component adds to its styles and never drops them.
export const ScreenEditorPrimeReactProvider = ({ defaults, theme, ...props }: ScreenEditorPrimeReactProviderProps) => {
    const fallback = usePrimeReactTheme(fallbackTheme);
    return <PrimeReactProvider {...props} theme={theme ?? fallback?.theme} defaults={mergeComponentDefaults(screenEditorPrimeReactDefaults, defaults)} />;
};
