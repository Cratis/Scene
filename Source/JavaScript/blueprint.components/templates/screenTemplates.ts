// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { commandTemplates } from './commandTemplates';
import { editorTemplates } from './editorTemplates';
import { listTemplates } from './listTemplates';
import { nestingChainTemplates } from './nesting';
import { workspaceTemplates } from './workspaceTemplates';

/**
 * The screen templates this blueprint provides.
 *
 * Eight whole pages that fill the application shell's `content` slot, plus the three-level chain that
 * demonstrates how `fitsSlot` composes at module, feature and slice level. The list is what the manifest's
 * `screenTemplates` names and what the bundle provides; `validatePackageBundle` proves the two agree.
 */
export const componentsScreenTemplates: ScreenTemplate[] = [
    ...listTemplates,
    ...workspaceTemplates,
    ...commandTemplates,
    ...editorTemplates,
    ...nestingChainTemplates,
];

/**
 * The eight templates that fill the application layout's own `content` slot directly.
 *
 * Kept apart from the nesting chain because `fitsSlot` is resolved against *the containers in scope*, and
 * these two groups are never in scope together. Each of these is a whole page an application places on its
 * own; the chain's three are one page assembled from three levels. Resolving them as one set would ask
 * `resolveScreenTemplates` which of eight `body`-declaring templates the feature section belongs to, and it
 * would rightly answer that it cannot tell.
 */
export const componentsPageTemplates: ScreenTemplate[] = [...listTemplates, ...workspaceTemplates, ...commandTemplates, ...editorTemplates];
