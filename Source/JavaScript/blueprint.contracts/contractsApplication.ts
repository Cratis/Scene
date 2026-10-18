// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { contractsNavigation, contractsStructure } from './navigation';
import { contractsScreens } from './screens';
import { contractsDialogTemplates, contractsScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const contractsDefaultSampleDataId = 'contracts-en';

/**
 * The example application of the blueprint: the foundation's layouts, the Contracts templates, the quick-create dialogs and their 4 screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/Contracts/contracts.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function contractsApplication(sampleData: string = contractsDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Contracts', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: contractsScreenTemplates, dialogTemplates: contractsDialogTemplates, screens: contractsScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const contractsComposition: CompositionOptions = { logo: contractsNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const contractsNavigationModel = () => ({ structure: new ApplicationStructureIndex(contractsStructure), navigation: contractsNavigation });
