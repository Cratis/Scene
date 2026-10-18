// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { vendorsNavigation, vendorsStructure } from './navigation';
import { vendorsScreens } from './screens';
import { vendorsDialogTemplates, vendorsScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const vendorsDefaultSampleDataId = 'vendors-en';

/**
 * The example application of the blueprint: the foundation's layouts, the Vendors templates, the quick-create dialogs and their 4 screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/Vendors/vendors.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function vendorsApplication(sampleData: string = vendorsDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Vendors', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: vendorsScreenTemplates, dialogTemplates: vendorsDialogTemplates, screens: vendorsScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const vendorsComposition: CompositionOptions = { logo: vendorsNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const vendorsNavigationModel = () => ({ structure: new ApplicationStructureIndex(vendorsStructure), navigation: vendorsNavigation });
