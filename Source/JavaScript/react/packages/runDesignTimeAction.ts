// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEdit, SceneEditKind } from '@cratis/scene.model';
import { DesignTimeAction, DesignTimeActionContext } from './DesignTimeAction';
import { DesignTimeActionOutcome } from './DesignTimeActionOutcome';

const editKinds = new Set<string>(Object.values(SceneEditKind));

/**
 * Runs one design-time action and hands its edit batch to the host as a single canonical batch, so the host's
 * own validation and undo/redo stay authoritative. A batch containing anything that is not a canonical Scene
 * edit is rejected whole - a partially applied action is never reported as success.
 */
export function runDesignTimeAction(action: DesignTimeAction, context: DesignTimeActionContext): DesignTimeActionOutcome {
    let result: { edits: SceneEdit[]; diagnostics: string[] };
    try {
        result = action.execute(context);
    } catch (error) {
        return { submitted: false, edits: [], diagnostics: [`Action '${action.descriptor.id}' failed: ${String(error)}`] };
    }

    const invalid = result.edits.filter(edit => !editKinds.has((edit as { kind?: string }).kind ?? ''));
    if (invalid.length > 0) {
        return {
            submitted: false,
            edits: result.edits,
            diagnostics: [...result.diagnostics, `Action '${action.descriptor.id}' produced ${invalid.length} edit(s) that are not canonical Scene edits; nothing was submitted`],
        };
    }

    if (result.edits.length === 0) return { submitted: false, edits: [], diagnostics: result.diagnostics };

    context.submitAction(action.descriptor.id, result.edits);
    return { submitted: true, edits: result.edits, diagnostics: result.diagnostics };
}
