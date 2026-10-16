// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { crmNavigation, crmStructure } from './navigation';
import { crmScreens } from './screens';
import { crmDialogTemplates, crmScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const crmDefaultSampleDataId = 'crm-enterprise-en';

/**
 * The example application of the blueprint: the foundation's layouts, the CRM's templates and quick-create dialogs and its twenty screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/Crm/crm.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function crmApplication(sampleData: string = crmDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'CRM', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: crmScreenTemplates, dialogTemplates: crmDialogTemplates, screens: crmScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const crmComposition: CompositionOptions = { logo: crmNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const crmNavigationModel = () => ({ structure: new ApplicationStructureIndex(crmStructure), navigation: crmNavigation });
