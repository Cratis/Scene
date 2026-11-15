// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScenePackageBundle } from '@cratis/scene.react';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../UiProfile/defaultUiProfileSettings';
import type { PersistedUiProfile } from '../../UiProfile/PersistedUiProfile';
import type { SampleDataSelectionSettings } from '../../UiProfile/SampleDataSelectionSettings';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import { packagesOrLegacyFallback } from '../../UiProfile/packagesOrLegacyFallback';
import { toSceneUiProfile } from '../../UiProfile/toSceneUiProfile';
import { withStoredLook, type StoredLook } from '../../UiProfile/withStoredLook';
import type { ScreenEditorAppearance } from './ScreenEditorAppearance';
import { createScreenEditorRuntime, type ScreenEditorRuntime } from './screenEditorRuntime';

// The runtime a host opens the editor with: the components Scene can draw are decided by the application's UI profile,
// so the runtime follows it. A host that has no stored profile gets the default one over the bundles in play, which is what
// legacy applications render with.
export function screenEditorRuntimeForProfile(applied?: PersistedUiProfile, bundles: ScenePackageBundle[] = blueprintPreviewBundles, appearance?: ScreenEditorAppearance, sampleData?: SampleDataSelectionSettings, look?: StoredLook): ScreenEditorRuntime {
    // `look` is what the application stored beside the legacy members: a host that is the application (the preview) passes it, so the accent, logo, corners, font
    // and menu of the application show; a host that draws in a look of its own (the screen editor) does not.
    const profile = applied
        ? withStoredLook(toSceneUiProfile(packagesOrLegacyFallback(applied, bundles), sampleData), applied, look, sampleData, bundles)
        : resolveUiProfile(defaultUiProfileSettings(bundles), bundles).profile;
    return createScreenEditorRuntime(bundles, profile, appearance);
}
