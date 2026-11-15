// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind, type ApplicationStructure, type SceneEdit } from '@cratis/scene.model';
import { ApplicationStructureIndex, elementNodeId, normalizeToolbarButton, toolbarButtonFromItem } from '@cratis/scene.engine';

// A toolbar button that still names a hand-typed command (`target`) and no slice is the older click-behaviour shape. Scene converts it to the slice that accepts the
// command when exactly one does (`normalizeToolbarButton`, the same rule the preview, Stage and the converter apply when they resolve the button); this reads that answer
// so the editor shows the slice the button already runs, and offers to write it into the document.
export function upgradeOf(structure: ApplicationStructure, id: string, properties: Record<string, unknown>): { slice: string } | undefined {
    if (structure.modules.length === 0) return undefined;
    const button = toolbarButtonFromItem(id, properties);
    if (!button || button.slice) return undefined;
    const { button: normalized, converted } = normalizeToolbarButton(new ApplicationStructureIndex(structure), button);
    return converted && normalized.slice ? { slice: normalized.slice } : undefined;
}

// The edits that write the upgrade: the slice it resolves to, and the command it replaces cleared - one undo step.
export function upgradeEdits(id: string, slice: string): SceneEdit[] {
    return [
        { kind: SceneEditKind.SetProperty, nodeId: elementNodeId(id), path: 'slice', value: slice },
        { kind: SceneEditKind.ResetProperty, nodeId: elementNodeId(id), path: 'target' },
    ];
}
