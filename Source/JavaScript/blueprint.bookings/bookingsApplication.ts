// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { bookingsNavigation, bookingsStructure } from './navigation';
import { bookingsScreens } from './screens';
import { bookingsDialogTemplates, bookingsScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const bookingsDefaultSampleDataId = 'bookings-en';

/**
 * The example application of the blueprint: the foundation's layouts, the Bookings templates, the quick-create dialogs and their 5 screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/Bookings/bookings.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function bookingsApplication(sampleData: string = bookingsDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Bookings', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: bookingsScreenTemplates, dialogTemplates: bookingsDialogTemplates, screens: bookingsScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const bookingsComposition: CompositionOptions = { logo: bookingsNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const bookingsNavigationModel = () => ({ structure: new ApplicationStructureIndex(bookingsStructure), navigation: bookingsNavigation });
