// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory } from '@cratis/scene.model';
import { ComponentMetadata, componentMetadata as m } from '@cratis/scene.react';

/** The category, icon, keywords and picker badge of every component of the package (CMP1), keyed by bare component name. */
export const componentsBlueprintComponentMetadata: Record<string, ComponentMetadata> = {
    arcPageHeader: m('Arc page header', ComponentCategory.Layout, 'heading', ['title', 'header', 'arc', 'command']),
};
