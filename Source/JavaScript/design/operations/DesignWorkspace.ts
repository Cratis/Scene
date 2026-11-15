// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, QueryCandidate, SceneDocument, ScreenTemplate, UiProfile } from '@cratis/scene.model';
import { DesignCatalogue } from '../catalogue/DesignCatalogue';
import { DesignCatalogueInput } from '../catalogue/DesignCatalogueInput';
import { buildDesignCatalogue } from '../catalogue/buildDesignCatalogue';
import { ScreenSet } from '../screenSet/ScreenSet';

/** What design operations change: the Scene document, the UI profile and the set of screens with their storylines. */
export interface DesignWorkspace {
    document: SceneDocument;
    profile?: UiProfile;
    screenSet: ScreenSet;
}

/** What operations are checked and lowered against: the catalogue, and the descriptors and templates it was built from. */
export interface DesignContext {
    catalogue: DesignCatalogue;
    descriptors: ComponentDescriptor[];
    /** Every template the host has, to copy into the document when a screen is built on one. */
    templates: ScreenTemplate[];
    queryCandidates?: QueryCandidate[];
}

/** Builds the catalogue of an input and keeps what the operations need besides it. */
export function createDesignContext(input: DesignCatalogueInput): DesignContext {
    const context: DesignContext = { catalogue: buildDesignCatalogue(input), descriptors: input.descriptors, templates: input.templates };
    if (input.queries !== undefined) context.queryCandidates = input.queries;
    return context;
}
