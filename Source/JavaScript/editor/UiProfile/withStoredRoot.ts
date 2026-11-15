// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutMode, layoutModes } from '@cratis/scene.blueprint.default';
import { navigationModes, normalizeNavigationMode } from '@cratis/scene.engine';
import { TemplateReferenceSource } from '@cratis/scene.model';
import type { StoredUiProfileRoot } from './StoredUiProfileShape';
import type { UiProfileSettings } from './UiProfileSettings';

/**
 * The settings with the root template the application stored: its template with its version pin, the options of the shell and the navigation mode among them.
 * A profile that stored none (the legacy shape, or the bare shell) is left as it is - the blueprint's first layout is then its shell.
 *
 * @param settings What the legacy members say.
 * @param root The stored root template, when the profile has one.
 * @returns The settings, with `root` when the profile stored one.
 */
export function withStoredRoot(settings: UiProfileSettings, root: StoredUiProfileRoot | undefined): UiProfileSettings {
    const reference = root?.template;
    if (root === undefined || reference === undefined || reference.source.length === 0 || reference.id.length === 0) return settings;

    const options = optionsOf(root.optionsJson);
    const typed = normalizeNavigationMode(options.navigationMode);
    const mode = layoutModes.find(candidate => candidate === navigationModes.find(info => info.id === typed)?.legacy);
    const menuTheme = typeof options.menuTheme === 'string' && ['light', 'dark', 'primary'].includes(options.menuTheme) ? options.menuTheme : undefined;
    return {
        ...settings,
        shell: reference.source === 'blueprint' ? reference.blueprint : '',
        root: {
            template: {
                source: reference.source === 'own' ? TemplateReferenceSource.Own : TemplateReferenceSource.Blueprint,
                id: reference.id,
                ...(reference.blueprint.length > 0 ? { blueprint: reference.blueprint } : {}),
                ...(reference.version.length > 0 ? { version: reference.version } : {}),
            },
            options,
        },
        navigationMode: mode ?? settings.navigationMode ?? LayoutMode.Static,
        ...(menuTheme === undefined ? {} : { menuTheme }),
    };
}

function optionsOf(json: string | undefined): Record<string, unknown> {
    if (!json) return {};
    try {
        const parsed: unknown = JSON.parse(json);
        return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
    } catch {
        return {};
    }
}
