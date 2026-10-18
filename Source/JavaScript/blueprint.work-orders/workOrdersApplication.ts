// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { workOrdersNavigation, workOrdersStructure } from './navigation';
import { workOrdersScreens } from './screens';
import { workOrdersDialogTemplates, workOrdersScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const workOrdersDefaultSampleDataId = 'work-orders-en';

/**
 * The example application of the blueprint: the foundation's layouts, the Work orders templates, the quick-create dialogs and their 4 screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/WorkOrders/work-orders.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function workOrdersApplication(sampleData: string = workOrdersDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Work orders', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: workOrdersScreenTemplates, dialogTemplates: workOrdersDialogTemplates, screens: workOrdersScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const workOrdersComposition: CompositionOptions = { logo: workOrdersNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const workOrdersNavigationModel = () => ({ structure: new ApplicationStructureIndex(workOrdersStructure), navigation: workOrdersNavigation });
