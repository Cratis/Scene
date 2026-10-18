// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { customerPortalNavigation, customerPortalStructure } from './navigation';
import { customerPortalScreens } from './screens';
import { customerPortalDialogTemplates, customerPortalScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const customerPortalDefaultSampleDataId = 'customer-portal-en';

/**
 * The example application of the blueprint: the foundation's layouts, the Customer portal templates, the quick-create dialogs and their 6 screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/CustomerPortal/customer-portal.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function customerPortalApplication(sampleData: string = customerPortalDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Customer portal', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: customerPortalScreenTemplates, dialogTemplates: customerPortalDialogTemplates, screens: customerPortalScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const customerPortalComposition: CompositionOptions = { logo: customerPortalNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const customerPortalNavigationModel = () => ({ structure: new ApplicationStructureIndex(customerPortalStructure), navigation: customerPortalNavigation });
