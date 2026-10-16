// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { administrationNavigation, administrationStructure } from './navigation';
import { administrationScreens } from './screens';
import { administrationDialogTemplates, administrationScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const administrationDefaultSampleDataId = 'admin-default';

/**
 * The example application of the blueprint: the foundation's layouts, the Administration templates and quick-create dialogs and its five screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/Administration/administration.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function administrationApplication(sampleData: string = administrationDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Administration', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: administrationScreenTemplates, dialogTemplates: administrationDialogTemplates, screens: administrationScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const administrationComposition: CompositionOptions = { logo: administrationNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const administrationNavigationModel = () => ({ structure: new ApplicationStructureIndex(administrationStructure), navigation: administrationNavigation });
