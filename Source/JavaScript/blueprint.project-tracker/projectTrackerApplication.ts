// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { projectTrackerNavigation, projectTrackerStructure } from './navigation';
import { projectTrackerScreens } from './screens';
import { projectTrackerDialogTemplates, projectTrackerScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const projectTrackerDefaultSampleDataId = 'project-tracker-en';

/**
 * The example application of the blueprint: the foundation's layouts, the Project and Task Tracker templates and quick-create dialogs and its four screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/ProjectTracker/project-tracker.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function projectTrackerApplication(sampleData: string = projectTrackerDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Project and Task Tracker', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: projectTrackerScreenTemplates, dialogTemplates: projectTrackerDialogTemplates, screens: projectTrackerScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const projectTrackerComposition: CompositionOptions = { logo: projectTrackerNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const projectTrackerNavigationModel = () => ({ structure: new ApplicationStructureIndex(projectTrackerStructure), navigation: projectTrackerNavigation });
