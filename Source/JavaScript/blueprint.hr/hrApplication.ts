// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { hrNavigation, hrStructure } from './navigation';
import { hrScreens } from './screens';
import { hrDialogTemplates, hrScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const hrDefaultSampleDataId = 'hr-nordic';

/**
 * The example application of the blueprint: the foundation's layouts, the HR People and Time Off templates and quick-create dialogs and its seven screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/Hr/hr.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function hrApplication(sampleData: string = hrDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'HR People and Time Off', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: hrScreenTemplates, dialogTemplates: hrDialogTemplates, screens: hrScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const hrComposition: CompositionOptions = { logo: hrNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const hrNavigationModel = () => ({ structure: new ApplicationStructureIndex(hrStructure), navigation: hrNavigation });
