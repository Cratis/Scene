// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme } from './ColorScheme';
import { LayoutConfigState } from './LayoutConfigState';
import { LayoutMode } from './LayoutMode';
import { MenuTheme } from './MenuTheme';
import { defaultLayoutConfigState } from './layoutConfigTransitions';

/** The `localStorage` key the shell persists its configuration under. */
export const layoutConfigStorageKey = 'cratis.scene.layout.default';

/**
 * The parts of {@link LayoutConfigState} worth surviving a reload.
 *
 * Deliberately not the whole record: whether the sidebar happened to be open, whether the pointer was
 * over it, and whether the viewport was narrow are all facts about the moment rather than preferences, and
 * restoring them produces a shell that opens in a state the user never chose. The pin *is* a preference,
 * so it stays.
 */
export type PersistedLayoutConfig = Pick<LayoutConfigState, 'mode' | 'menuTheme' | 'colorScheme' | 'themeName' | 'isSidebarAnchored'>;

/**
 * Reads the persisted configuration back, falling back to {@link defaultLayoutConfigState} for anything
 * missing or unrecognized.
 *
 * Everything is validated against the enums rather than trusted, because `localStorage` is shared with
 * every other script on the origin and outlives the version of this package that wrote it. An unknown
 * mode left in place would put a class on the wrapper that no stylesheet rule matches - a shell with no
 * sidebar at all, and no error to explain it.
 *
 * @param storage The storage to read from, or `undefined` when there is none (server-side rendering).
 * @returns The restored state, with defaults filled in.
 */
export function readPersistedLayoutConfig(storage?: Storage): LayoutConfigState {
    const defaults = defaultLayoutConfigState();
    const stored = readRecord(storage);
    if (!stored) {
        return defaults;
    }

    return {
        ...defaults,
        mode: enumValue(Object.values(LayoutMode), stored.mode) ?? defaults.mode,
        menuTheme: enumValue(Object.values(MenuTheme), stored.menuTheme) ?? defaults.menuTheme,
        colorScheme: enumValue(Object.values(ColorScheme), stored.colorScheme) ?? defaults.colorScheme,
        themeName: typeof stored.themeName === 'string' ? stored.themeName : defaults.themeName,
        isSidebarAnchored: typeof stored.isSidebarAnchored === 'boolean' ? stored.isSidebarAnchored : defaults.isSidebarAnchored,
    };
}

/**
 * Writes the durable parts of the configuration.
 *
 * Storage can throw - Safari's private mode and a full quota both do - and a shell that cannot remember a
 * preference is a far smaller problem than one that crashes on a mode switch, so a failure here is
 * swallowed rather than propagated.
 *
 * @param state The state to persist.
 * @param storage The storage to write to, or `undefined` when there is none.
 */
export function persistLayoutConfig(state: LayoutConfigState, storage?: Storage): void {
    if (!storage) {
        return;
    }

    const persisted: PersistedLayoutConfig = {
        mode: state.mode,
        menuTheme: state.menuTheme,
        colorScheme: state.colorScheme,
        themeName: state.themeName,
        isSidebarAnchored: state.isSidebarAnchored,
    };

    try {
        storage.setItem(layoutConfigStorageKey, JSON.stringify(persisted));
    } catch {
        // A browser that refuses to store a preference still has to render the shell.
    }
}

function readRecord(storage?: Storage): Record<string, unknown> | undefined {
    if (!storage) {
        return undefined;
    }

    try {
        const raw = storage.getItem(layoutConfigStorageKey);
        if (!raw) {
            return undefined;
        }

        const parsed = JSON.parse(raw) as unknown;
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : undefined;
    } catch {
        return undefined;
    }
}

function enumValue<TValue extends string>(values: TValue[], candidate: unknown): TValue | undefined {
    return typeof candidate === 'string' && values.includes(candidate as TValue) ? (candidate as TValue) : undefined;
}
