// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument, Theme, UiProfile } from '@cratis/scene.model';

/**
 * What an application is made of: the document a designer edits - layouts, templates, screens, and what a template exposes and
 * each instance contributes - and the profile and theme the application renders with. Stage assembles it from a Screenplay
 * model, Studio from the model in memory (unsaved edits included); the composition and the hosts take nothing else.
 */
export type ApplicationDocument =
    & Pick<SceneDocument, 'layouts' | 'screenTemplates' | 'screens'>
    & Partial<Pick<SceneDocument, 'dialogTemplates' | 'exposures' | 'instanceContributions'>>
    & {
        /** The profiles the application declares; the first for the web is the one rendered with. */
        uiProfiles?: UiProfile[];

        themes?: Theme[];
    };

/** The document with everything a template chain needs filled in. */
export function completeDocument(application: ApplicationDocument): SceneDocument {
    return {
        layouts: application.layouts,
        screenTemplates: application.screenTemplates,
        dialogTemplates: application.dialogTemplates ?? [],
        screens: application.screens,
        exposures: application.exposures ?? [],
        instanceContributions: application.instanceContributions ?? [],
    };
}
