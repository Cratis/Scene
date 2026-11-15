// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Screen } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../../UiProfile/defaultUiProfileSettings';
import { shellLibraryOf } from '../shellLibraryOf';
import type { ShellSwitchContext } from '../shellSwitch';

export const defaultBlueprint = 'Cratis.Blueprint.Default';

// The profile every application starts with - AppShell of the default blueprint - and what Scene says about the blueprints Studio ships.
export const settings = defaultUiProfileSettings(blueprintPreviewBundles);

export const contextWith = (screens: Screen[] = []): ShellSwitchContext => ({ bundles: blueprintPreviewBundles, library: shellLibraryOf(blueprintPreviewBundles), screens });

// A screen that puts something in the slot, which the shell it is switched to may not have.
export const screenPlacing = (name: string, slot: string): Screen => ({
    name,
    layout: 'AppShell',
    slotContent: { [slot]: [{ id: `${name}-content`, type: 'text' } as never] },
    forms: [],
    contributions: [],
} as Screen);
