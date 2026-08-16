// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentRegistry, componentRegistryKey } from '@cratis/scene.react';
import { ComponentName } from './ComponentName';
import { componentsBlueprintName } from './packageName';
import { ArcPageHeader } from './header';

/**
 * The components this package registers, keyed the way the renderer looks them up.
 *
 * Every key is built with `componentRegistryKey` rather than written out, because the separator between
 * package and component name is the registry's own business - it is deliberately not the `.` a screen uses
 * to qualify a name, so that a package name containing dots stays unambiguous. Building a key by hand is
 * how a component ends up registered under something no lookup will ever produce.
 *
 * One entry, and a short registry is the healthy outcome here rather than a gap. What this blueprint
 * contributes is templates; a component only appears when a template genuinely could not express the
 * composition, and `validatePackageBundle` proves that whatever *is* here is also declared in the manifest.
 */
export const componentsBlueprintComponents: ComponentRegistry = {
    [componentRegistryKey(componentsBlueprintName, ComponentName.ArcPageHeader)]: ArcPageHeader,
};
