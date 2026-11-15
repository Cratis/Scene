// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentAnatomy } from '@cratis/scene.model';
import { componentAnatomy } from '@cratis/scene.react';
import { ComponentName } from './ComponentName';

const shell = componentAnatomy(['background', 'text', 'font'], ['default']);
const surface = componentAnatomy(['background', 'text', 'border'], ['default']);

/**
 * What each of this blueprint's components takes from a design system (R2), keyed by the bare component name: the parts it draws, the
 * variants it renders and the states it reacts to. The shell is a component of the design system like any other - its surfaces and text
 * come from the anatomy of `Shell`, `Topbar`, `Sidebar`, `Menu`, `Popover`, `Footer` and `StatusChip` - so `layout.css` never names a token.
 *
 * `sidebar` is chosen by the root template's `menuTheme` option, and `statusChip` by its `tone`.
 */
export const defaultBlueprintAnatomy: Readonly<Record<string, ComponentAnatomy>> = {
    [ComponentName.AppShell]: shell,
    [ComponentName.FullPageShell]: shell,
    [ComponentName.Topbar]: surface,
    [ComponentName.Sidebar]: componentAnatomy(['background', 'text', 'border'], ['default', 'primary'], [], 'menuTheme'),
    [ComponentName.Menu]: componentAnatomy(['background', 'text', 'border', 'radius'], ['default'], ['hover', 'selected']),
    [ComponentName.Footer]: componentAnatomy(['background', 'text'], ['default']),
    [ComponentName.UserMenu]: componentAnatomy(['background', 'text', 'border', 'radius'], ['default'], ['hover', 'selected']),
    [ComponentName.StatusChip]: componentAnatomy(['text', 'background'], ['success', 'warning', 'danger', 'info', 'neutral'], [], 'tone'),
};
