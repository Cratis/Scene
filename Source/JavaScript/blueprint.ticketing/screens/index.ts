// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Screen } from '@cratis/scene.model';
import { LayoutName } from '@cratis/scene.blueprint.default';
import { ticketingScreenDefinitions } from '../ticketingScreenSet';

/**
 * The ready-to-use screens: real `Screen` instances, one for each entry of the manifest's `blueprint.screenSet`, each filling the screen template it names in the
 * foundation's application shell - or, for the public portal form, in the full-page layout. A new application that adopts the blueprint gets these, wired into
 * its navigation (`ticketingNavigation`).
 */
export const ticketingScreens: Screen[] = ticketingScreenDefinitions.map(definition => ({
    name: definition.name,
    layout: definition.layout === 'FullPage' ? LayoutName.FullPage : LayoutName.AppShell,
    screenTemplate: definition.template,
    slotContent: {},
    forms: [],
    contributions: [],
    path: definition.name.split('.'),
}));
