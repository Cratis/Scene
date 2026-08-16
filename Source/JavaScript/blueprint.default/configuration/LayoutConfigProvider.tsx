// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ColorScheme } from './ColorScheme';
import { LayoutConfigState } from './LayoutConfigState';
import { LayoutMode } from './LayoutMode';
import { MenuTheme } from './MenuTheme';
import { persistLayoutConfig, readPersistedLayoutConfig } from './layoutConfigStorage';
import { isLayoutMaskVisible, layoutWrapperClasses } from './layoutWrapperClasses';
import {
    effectiveLayoutMode,
    isMobileWidth,
    mobileMediaQuery,
    toggleSidebar,
    toggleSidebarAnchor,
    withColorScheme,
    withMenuTheme,
    withMobile,
    withMode,
    withSidebarOpen,
    withSidebarRevealed,
    withThemeName,
} from './layoutConfigTransitions';

/**
 * What {@link useLayoutConfig} hands a shell component: the current state, the values every part of the
 * shell derives from it, and one function per transition.
 *
 * The derived values live here rather than being recomputed per component so that the topbar, the
 * sidebar and the mask cannot end up disagreeing about which mode is in force - the exact class of bug a
 * shell with per-component state produces.
 */
export interface LayoutConfigContextValue {
    /** The current state. */
    config: LayoutConfigState;

    /** The mode actually in force, with the mobile override applied. */
    effectiveMode: LayoutMode;

    /** The classes for the shell's wrapper element. */
    wrapperClasses: string[];

    /** Whether the scrim behind a floating sidebar should be showing. */
    isMaskVisible: boolean;

    /** Chooses a different mode. Below the mobile breakpoint the choice is still recorded, but the shell keeps rendering off-canvas. */
    setMode(mode: LayoutMode): void;

    /** Chooses how the sidebar surface is tinted. */
    setMenuTheme(menuTheme: MenuTheme): void;

    /** Chooses the light/dark axis. */
    setColorScheme(colorScheme: ColorScheme): void;

    /** Records which theme is applied. */
    setThemeName(themeName: string): void;

    /** Opens or closes the sidebar. */
    setSidebarOpen(isOpen: boolean): void;

    /** Flips the sidebar between open and closed. */
    toggleSidebar(): void;

    /** Holds a `reveal`/`drawer` sidebar out, or lets it fall back. */
    setSidebarRevealed(isRevealed: boolean): void;

    /** Pins or unpins a `reveal`/`drawer` sidebar. */
    toggleSidebarAnchor(): void;
}

const LayoutConfigContext = createContext<LayoutConfigContextValue | undefined>(undefined);

export interface LayoutConfigProviderProps {
    /** Values to start from, overriding both the defaults and anything persisted - a story or a spec pinning a mode. */
    initialConfig?: Partial<LayoutConfigState>;

    /**
     * Where preferences are read from and written to. Defaults to `window.localStorage` when there is a
     * window; pass a fake in a spec, or `null` to opt out of persistence entirely.
     */
    storage?: Storage | null;

    /**
     * The width the shell should consider its viewport, for a host that renders it into a sized element
     * rather than the window - Studio's preview surface, where the device frame is a few hundred pixels
     * wide while the real window is a desktop one. When given, this replaces the `matchMedia` listener
     * entirely rather than competing with it.
     */
    viewportWidth?: number;

    /** The shell this configuration applies to. */
    children?: ReactNode;
}

/**
 * Owns the shell's configuration and keeps it in step with the viewport and with `localStorage`.
 *
 * One provider rather than state per shell component is what makes the modes work at all: the topbar's
 * toggle, the sidebar's pin, the mask's click-to-close and the configurator's mode picker are four
 * different components acting on one machine. It is also what makes a chosen mode survive a reload, which
 * is the whole reason a mode picker is worth having.
 */
export function LayoutConfigProvider({ initialConfig, storage, viewportWidth, children }: LayoutConfigProviderProps) {
    const resolvedStorage = useMemo(() => (storage !== undefined ? storage ?? undefined : defaultStorage()), [storage]);
    const [config, setConfig] = useState<LayoutConfigState>(() => ({
        ...readPersistedLayoutConfig(resolvedStorage),
        ...initialConfig,
    }));

    useEffect(() => {
        persistLayoutConfig(config, resolvedStorage);
    }, [config, resolvedStorage]);

    const isReportedMobile = viewportWidth === undefined ? undefined : isMobileWidth(viewportWidth);
    useEffect(() => {
        if (isReportedMobile !== undefined) {
            setConfig(current => withMobile(current, isReportedMobile));
            return;
        }

        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const query = window.matchMedia(mobileMediaQuery);
        setConfig(current => withMobile(current, query.matches));

        const listener = (event: MediaQueryListEvent) => setConfig(current => withMobile(current, event.matches));
        query.addEventListener('change', listener);
        return () => query.removeEventListener('change', listener);
    }, [isReportedMobile]);

    const value = useMemo<LayoutConfigContextValue>(
        () => ({
            config,
            effectiveMode: effectiveLayoutMode(config),
            wrapperClasses: layoutWrapperClasses(config),
            isMaskVisible: isLayoutMaskVisible(config),
            setMode: mode => setConfig(current => withMode(current, mode)),
            setMenuTheme: menuTheme => setConfig(current => withMenuTheme(current, menuTheme)),
            setColorScheme: colorScheme => setConfig(current => withColorScheme(current, colorScheme)),
            setThemeName: themeName => setConfig(current => withThemeName(current, themeName)),
            setSidebarOpen: isOpen => setConfig(current => withSidebarOpen(current, isOpen)),
            toggleSidebar: () => setConfig(toggleSidebar),
            setSidebarRevealed: isRevealed => setConfig(current => withSidebarRevealed(current, isRevealed)),
            toggleSidebarAnchor: () => setConfig(toggleSidebarAnchor),
        }),
        [config],
    );

    return <LayoutConfigContext.Provider value={value}>{children}</LayoutConfigContext.Provider>;
}

/**
 * The shell configuration, or `undefined` when there is no {@link LayoutConfigProvider} above.
 *
 * This is what lets the shell components put a provider around themselves when a host has not - a gallery
 * preview drops a single `appShell` element into a renderer with no wrapper of its own, and it still has
 * to work.
 */
export function useOptionalLayoutConfig(): LayoutConfigContextValue | undefined {
    return useContext(LayoutConfigContext);
}

/**
 * The shell configuration. Throws when there is no {@link LayoutConfigProvider} above, because every
 * alternative - a silent default, a no-op setter - produces a shell whose buttons do nothing and says
 * nothing about why.
 */
export function useLayoutConfig(): LayoutConfigContextValue {
    const value = useOptionalLayoutConfig();
    if (!value) {
        throw new Error('useLayoutConfig() requires a <LayoutConfigProvider> above it.');
    }

    return value;
}

function defaultStorage(): Storage | undefined {
    return typeof window !== 'undefined' ? window.localStorage : undefined;
}
