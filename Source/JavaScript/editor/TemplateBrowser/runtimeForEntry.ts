// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScenePackageBundle } from '@cratis/scene.react';
import { createScreenEditorRuntime } from '../ScreenEditor/Runtime/screenEditorRuntime';
import { resolveUiProfile } from '../UiProfile/resolveUiProfile';
import type { UiProfileSettings } from '../UiProfile/UiProfileSettings';
import type { TemplateBrowserEntry } from './TemplateBrowserEntry';
import type { TemplateBrowserRuntime } from './TemplateBrowserPreview';

/**
 * What to draw a template's preview with. A template of a blueprint that is in the profile is drawn under that profile; one of a blueprint that is not
 * would find none of its components there, so it is drawn under the profile it would have if the blueprint were added - nothing is added, this is only how
 * the preview is composed.
 *
 * @param entry The template to preview.
 * @param runtime The runtime of the application's profile.
 * @param settings The application's profile settings.
 * @param bundles Every package the build has loaded.
 * @returns The runtime to preview with.
 */
export function runtimeForEntry(entry: TemplateBrowserEntry | undefined, runtime: TemplateBrowserRuntime, settings: UiProfileSettings, bundles: readonly ScenePackageBundle[]): TemplateBrowserRuntime {
    if (entry === undefined || entry.installed || entry.package === undefined) return runtime;
    const profile = resolveUiProfile({ ...settings, templatePacks: [...settings.templatePacks, entry.package] }, [...bundles]).profile;
    const created = createScreenEditorRuntime([...bundles], profile);
    return { bundles: created.bundles, profile: created.profile, registry: created.registry, iconAdapters: created.iconAdapters };
}
