// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, useMemo } from 'react';
import { Theme } from '@cratis/scene.model';
import { SceneThemeProvider } from '@cratis/scene.react';
import { useLayoutConfig } from '../configuration';
import { defaultBlueprintThemes } from './defaultBlueprintThemes';

export interface LayoutThemeProviderProps {
    /** The themes to choose between. Defaults to the two this package ships. */
    themes?: Theme[];

    /** The shell the chosen theme applies to. */
    children?: ReactNode;

    /** A class name for the element the tokens land on. */
    className?: string;
}

/**
 * Applies whichever theme the shell's configuration currently names.
 *
 * This is the seam between the configurator and `SceneThemeProvider`: the configurator only ever records
 * a name, and this resolves that name against the theme set a host offers. Keeping the shell's state
 * free of the theme object itself is what lets a host swap in an entirely different theme set - its own
 * brand palettes - without the configurator or any shell component changing.
 *
 * Switching is live re-resolution, not a reload: `SceneThemeProvider` writes the new tokens onto the same
 * element, so nothing below it remounts and no state is lost.
 */
export function LayoutThemeProvider({ themes = defaultBlueprintThemes, children, className }: LayoutThemeProviderProps) {
    const { config } = useLayoutConfig();
    const theme = useMemo(() => themes.find(candidate => candidate.name === config.themeName) ?? themes[0], [themes, config.themeName]);

    return (
        <SceneThemeProvider theme={theme} className={className}>
            {children}
        </SceneThemeProvider>
    );
}
