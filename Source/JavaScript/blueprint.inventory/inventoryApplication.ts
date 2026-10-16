// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UiProfile } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { ApplicationDocument, CompositionOptions, defaultLayouts, previewProfile } from '@cratis/scene.blueprint.default';
import { inventoryNavigation, inventoryStructure } from './navigation';
import { inventoryScreens } from './screens';
import { inventoryDialogTemplates, inventoryScreenTemplates } from './templates';

/** The id of the sample-data pack a new application starts with. */
export const inventoryDefaultSampleDataId = 'inventory-warehouse';

/**
 * The example application of the blueprint: the foundation's layouts, the Inventory and Assets templates and quick-create dialogs and its eight screens, rendering against the
 * foundation's packages with the default sample-data pack chosen. This is what a gallery previews and what the conformance fixture
 * (`Samples/Inventory/inventory.play`) declares in Screenplay: the document, the structure and the navigation are the three things an application is made of.
 */
export function inventoryApplication(sampleData: string = inventoryDefaultSampleDataId): ApplicationDocument {
    const profile: UiProfile = { ...previewProfile(undefined), name: 'Inventory and Assets', sampleData: { activePack: sampleData, mappings: [], bindings: [] } };
    return { layouts: defaultLayouts, screenTemplates: inventoryScreenTemplates, dialogTemplates: inventoryDialogTemplates, screens: inventoryScreens, uiProfiles: [profile] };
}

/** What a host composes the screens with: the application's logo, which the shell's topbar shows. */
export const inventoryComposition: CompositionOptions = { logo: inventoryNavigation.application.logo };

/** The structure and navigation the shell's regions show and the items' destinations resolve against. */
export const inventoryNavigationModel = () => ({ structure: new ApplicationStructureIndex(inventoryStructure), navigation: inventoryNavigation });
