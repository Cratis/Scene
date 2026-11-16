// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PreviewTarget } from '@cratis/scene.blueprint.default';
import { PreviewNodeKind, type PreviewNodeRef } from './PreviewScene';

/**
 * What the preview host is asked to show for a node of the board (spec PRV3): a module shows its first feature in the shell, a
 * feature itself, a slice its dialog or data. The node is named by the identifier the scene knows it by.
 *
 * @param node The node preview was started from.
 * @returns The target, or `undefined` when the node is not one a preview can start from.
 */
export function previewTargetOf(node: PreviewNodeRef | undefined): PreviewTarget | undefined {
    switch (node?.kind) {
        case PreviewNodeKind.Module: return { module: node.sceneId };
        case PreviewNodeKind.Feature: return { module: node.sceneId.split('.')[0], feature: node.sceneId };
        case PreviewNodeKind.Slice: return { slice: node.sceneId };
        default: return undefined;
    }
}
