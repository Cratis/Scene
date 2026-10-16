// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Screen } from '@cratis/scene.model';
import { LayoutName } from '@cratis/scene.blueprint.default';
import { administrationScreenDefinitions } from '../administrationScreenSet';

/**
 * The ready-to-use screens: real `Screen` instances, one for each entry of the manifest's `blueprint.screenSet`, each filling the screen template it names in
 * the foundation's application shell. A new application that adopts the blueprint gets these, wired into its navigation (`administrationNavigation`).
 */
export const administrationScreens: Screen[] = administrationScreenDefinitions.map(definition => ({
    name: definition.name,
    layout: LayoutName.AppShell,
    screenTemplate: definition.template,
    slotContent: {},
    forms: [],
    contributions: [],
    path: definition.name.split('.'),
}));
