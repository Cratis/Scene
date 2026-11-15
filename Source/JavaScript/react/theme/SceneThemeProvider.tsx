// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { DesignSystem, ProfileAppearance, Theme } from '@cratis/scene.model';
import { ResolvedDesign, defaultDesignSystem, resolveDesign } from '@cratis/scene.engine';
import { applyDesign } from './designProperties';

interface SceneThemeContextValue {
    theme?: Theme;
    design?: ResolvedDesign;
}

const SceneThemeContext = createContext<SceneThemeContextValue>({});

/**
 * The theme currently applied by the nearest {@link SceneThemeProvider}, for a package component that has
 * to make a decision a custom property cannot express - picking a light or dark logo asset, say. Absent
 * when the provider was given a design rather than a theme.
 */
export function useSceneTheme(): Theme | undefined {
    return useContext(SceneThemeContext).theme;
}

/**
 * The design - theme, mode and resolved anatomy - currently applied by the nearest {@link SceneThemeProvider}.
 */
export function useSceneDesign(): ResolvedDesign | undefined {
    return useContext(SceneThemeContext).design;
}

export interface SceneThemePropsBase {
    /**
     * The design to apply, already resolved (`resolveDesign`). Changing it re-resolves in place - no reload, no remount of the
     * subtree. Takes precedence over `theme`.
     */
    design?: ResolvedDesign;

    /**
     * A theme a package ships: a flat map of the values of the design system's token roles, for one mode. Resolved against
     * `designSystem` (the default design system when absent) together with `appearance`.
     */
    theme?: Theme;

    /**
     * The design system `theme` is resolved against. Absent, Scene's default design system - the one an application that names none
     * is drawn from.
     */
    designSystem?: DesignSystem;

    /** The accent, corners and font a profile replaces the theme's own with, applied when `theme` is resolved here. */
    appearance?: ProfileAppearance;

    /** The content the design applies to. */
    children?: ReactNode;

    /**
     * A class name for the element the custom properties land on.
     */
    className?: string;
}

/**
 * Applies a design - a design system resolved for one theme and mode - to a wrapping element as CSS custom properties, and makes
 * it available to everything inside.
 *
 * The anatomy of every component is emitted as `--ds-<component>-<variant>-<part>[-<state>]` and every token role as
 * `--ds-token-<category>-<name>`. A package reads anatomy only; it never names a token.
 *
 * Switching theme or mode is live re-resolution: the custom properties are written onto the same element rather than swapping a
 * stylesheet, so a preview changes without a flash and without losing any state below it. That is what lets Studio's gallery switch
 * themes as fast as you can click.
 */
export function SceneThemeProvider({ design, theme, designSystem, appearance, children, className }: SceneThemePropsBase) {
    const elementRef = useRef<HTMLDivElement>(null);
    const previousRef = useRef<ResolvedDesign | undefined>(undefined);

    const resolved = useMemo(() => {
        if (design !== undefined) return design;
        if (theme === undefined) return undefined;
        return resolveDesign({ designSystem: designSystem ?? defaultDesignSystem, theme: theme.name, packageThemes: [theme], appearance });
    }, [design, theme, designSystem, appearance]);

    useLayoutEffect(() => {
        if (!elementRef.current) return;
        applyDesign(elementRef.current, resolved, previousRef.current);
        previousRef.current = resolved;
    }, [resolved]);

    const value = useMemo(() => ({ theme, design: resolved }), [theme, resolved]);

    return (
        <div ref={elementRef} className={className} data-scene-theme-root=''>
            <SceneThemeContext.Provider value={value}>{children}</SceneThemeContext.Provider>
        </div>
    );
}
