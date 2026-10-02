// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExposureDeclaration, InstanceContribution } from '../exposure';
import { Layout } from '../layouts';
import { DialogTemplate, Screen, ScreenTemplate } from '../screens';

/**
 * Everything an editor works on: the application's layouts, the templates built on them, the screens filling
 * those, and the two things that make a template configurable - what each layout or template exposes, and what
 * each instance contributes.
 *
 * The engine's inspection and editing operations take a document and return a new one; they never change the
 * one they were given. Names are the identity of layouts and templates, and element ids must be unique across the
 * whole document.
 */
export interface SceneDocument {
    layouts: Layout[];
    screenTemplates: ScreenTemplate[];
    dialogTemplates: DialogTemplate[];
    screens: Screen[];

    /** What each layout or template lets its consumers configure. */
    exposures: ExposureDeclaration[];

    /** The values each template instance sets on what was exposed to it. */
    instanceContributions: InstanceContribution[];
}

export const SceneDocumentPropertyNames: (keyof SceneDocument)[] = [
    'layouts', 'screenTemplates', 'dialogTemplates', 'screens', 'exposures', 'instanceContributions',
];
