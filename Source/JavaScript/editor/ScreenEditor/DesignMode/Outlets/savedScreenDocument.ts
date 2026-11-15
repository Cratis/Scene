// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { withScreenAsPrimary } from '../../Document/screenSelection';
import { withoutLevelOutlets, type LevelRefinements } from './levelOutlets';

// What leaving the editor hands back about the document: the screen as the document keeps it, and - when the host keeps the levels of the outlets itself - those levels as
// their own, which the document then does not carry (StudioIssues#1327: a screen only stores its own refinements).
export function savedScreenDocument(document: SceneDocument, screen: string | undefined, hostKeepsLevels: boolean): { document: SceneDocument; levelOutlets?: LevelRefinements[] } {
    const primary = withScreenAsPrimary(document, screen);
    if (!hostKeepsLevels) return { document: primary };
    const split = withoutLevelOutlets(primary);
    return { document: split.document, levelOutlets: split.levels };
}
