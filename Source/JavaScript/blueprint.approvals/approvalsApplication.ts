// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { approvalsNavigation, approvalsStructure } from './navigation';
import { approvalsScreens } from './screens';
import { approvalsDialogTemplates, approvalsScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const approvalsDefaultSampleDataId = 'approvals-general';

/**
 * The example application of the blueprint: the foundation's layouts, the approvals application's templates and dialogs and its seven screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/Approvals/approvals.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function approvalsApplication(sampleData: string = approvalsDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Approvals', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: approvalsScreenTemplates, dialogTemplates: approvalsDialogTemplates, screens: approvalsScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const approvalsComposition: CompositionOptions = { logo: approvalsNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const approvalsNavigationModel = () => ({ structure: new ApplicationStructureIndex(approvalsStructure), navigation: approvalsNavigation });
