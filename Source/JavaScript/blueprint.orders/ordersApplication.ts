// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { ordersNavigation, ordersStructure } from './navigation';
import { ordersScreens } from './screens';
import { ordersDialogTemplates, ordersScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const ordersDefaultSampleDataId = 'orders-en';

/**
 * The example application of the blueprint: the foundation's layouts, the Orders templates, the quick-create dialog and its four screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/Orders/orders.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function ordersApplication(sampleData: string = ordersDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Orders', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: ordersScreenTemplates, dialogTemplates: ordersDialogTemplates, screens: ordersScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const ordersComposition: CompositionOptions = { logo: ordersNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const ordersNavigationModel = () => ({ structure: new ApplicationStructureIndex(ordersStructure), navigation: ordersNavigation });
