// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef } from 'react';
import { useLayoutConfig } from '@cratis/scene.blueprint.default';
import { UiProfileSettings } from './UiProfileSettings';

export interface PreviewConfigSyncProps {
    /** The draft whose visual defaults the shell should show. */
    settings: UiProfileSettings;
}

/**
 * Pushes the draft's navigation mode, theme and color scheme into the shell's layout configuration.
 *
 * The shell reads those from its own provider; the draft is the single source, so this renders nothing and
 * only keeps the two in step when the draft changes.
 */
export function PreviewConfigSync({ settings }: PreviewConfigSyncProps) {
    const layout = useLayoutConfig();
    // The provider hands out new setters whenever its configuration changes, and every setter produces a
    // new configuration, so depending on them would apply the draft again after each application of it.
    const latest = useRef(layout);
    latest.current = layout;

    useEffect(() => {
        latest.current.setMode(settings.navigationMode);
        latest.current.setColorScheme(settings.colorScheme);
        if (settings.theme.length > 0) latest.current.setThemeName(settings.theme);
    }, [settings.navigationMode, settings.colorScheme, settings.theme]);

    useEffect(() => {
        latest.current.setMenuTheme((settings.menuTheme ?? 'light') as Parameters<typeof layout.setMenuTheme>[0]);
    }, [settings.menuTheme]);

    return null;
}
