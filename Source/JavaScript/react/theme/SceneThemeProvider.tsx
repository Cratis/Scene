// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext, useLayoutEffect, useRef } from 'react';
import { Theme } from '@cratis/scene.model';
import { applyThemeTokens } from './themeTokens';

const SceneThemeContext = createContext<Theme | undefined>(undefined);

/**
 * The theme currently applied by the nearest {@link SceneThemeProvider}, for a package component that has
 * to make a decision a token cannot express - picking a light or dark logo asset, say.
 */
export function useSceneTheme(): Theme | undefined {
    return useContext(SceneThemeContext);
}

export interface SceneThemePropsBase {
    /**
     * The theme to apply. Changing it re-resolves in place - no reload, no remount of the subtree.
     */
    theme?: Theme;

    /**
     * The content the theme applies to.
     */
    children?: ReactNode;

    /**
     * A class name for the element the tokens land on.
     */
    className?: string;
}

/**
 * Applies a {@link Theme}'s tokens to a wrapping element and makes the theme available to everything
 * inside it.
 *
 * Theme switching is live re-resolution: the tokens are written onto the same element rather than
 * swapping a stylesheet, so a preview changes theme without a flash and without losing any state below
 * it. That is what lets Studio's gallery switch themes as fast as you can click.
 */
export function SceneThemeProvider({ theme, children, className }: SceneThemePropsBase) {
    const elementRef = useRef<HTMLDivElement>(null);
    const previousRef = useRef<Theme | undefined>(undefined);

    useLayoutEffect(() => {
        if (!elementRef.current) return;
        applyThemeTokens(elementRef.current, theme, previousRef.current);
        previousRef.current = theme;
    }, [theme]);

    return (
        <div ref={elementRef} className={className} data-scene-theme-root=''>
            <SceneThemeContext.Provider value={theme}>{children}</SceneThemeContext.Provider>
        </div>
    );
}
