// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScenePackageBundle } from '@cratis/scene.react';
import type { UiProfile } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../BlueprintPreview/blueprintPreviewCatalog';
import type { PersistedUiProfile } from './PersistedUiProfile';
import { previewProfileOf, resolveUiProfile } from './resolveUiProfile';
import type { SampleDataSelectionSettings } from './SampleDataSelectionSettings';
import { settingsFromPersisted } from './settingsFromPersisted';
import type { StoredUiProfileRoot, StoredUiProfileStyle } from './StoredUiProfileShape';
import { withStoredRoot } from './withStoredRoot';
import { withStoredStyle } from './profileStyle';

/** What an application stored beside the legacy members of its UI profile, which is the application's own look: the shell with its menu options and the identity, corners and font. */
export interface StoredLook {
    /** The root template and the options of the shell (menu mode and theme), when the profile is in the root-template shape. */
    root?: StoredUiProfileRoot;

    /** The name, logo, corners and font, when the profile stored them. */
    style?: StoredUiProfileStyle | null;
}

/**
 * Gives a Scene profile the application's own look: the accent and colour scheme, the logo and name, the corners and font, and the shell's menu mode
 * and menu theme. The preview and the UI Profile designer draw from the same resolution, so an application previews as the designer shows it and as it
 * will run - not in the theme's bare defaults, which is all the legacy members of the stored profile carry.
 *
 * @param profile The profile built from the legacy members.
 * @param persisted The stored profile the legacy members are read from.
 * @param look What the profile stored beside them.
 * @param sampleData The application's sample data choice.
 * @param bundles The bundles in play.
 * @returns The profile with the look; the input when the application stored none.
 */
export function withStoredLook(profile: UiProfile, persisted: PersistedUiProfile, look: StoredLook | undefined, sampleData?: SampleDataSelectionSettings, bundles: ScenePackageBundle[] = blueprintPreviewBundles): UiProfile {
    if (look === undefined || (look.root === undefined && (look.style === undefined || look.style === null))) return profile;
    const settings = withStoredStyle(withStoredRoot(settingsFromPersisted(persisted, sampleData), look.root), look.style);
    const resolved = resolveUiProfile(settings, bundles);
    const looked = previewProfileOf(resolved, settings);
    return {
        ...profile,
        ...(looked.appearance === undefined ? {} : { appearance: looked.appearance }),
        ...(looked.identity === undefined ? {} : { identity: looked.identity }),
        ...(looked.root === undefined ? {} : { root: looked.root }),
    };
}
