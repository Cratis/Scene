// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneEditKind } from '@cratis/scene.model';
import { DesignTimeComponentProps } from '@cratis/scene.react';
import { generateChecklistItemsActionId } from '../inspectionsDescriptors';

/**
 * The internal designer. It reads only the shared design-time context and changes the document only through
 * canonical edits and actions the host applies, so the host's validation and undo/redo stay in charge.
 */
export function ChecklistDesigner({ context }: DesignTimeComponentProps) {
    const canEdit = context.permissions.edit !== false;
    return <div aria-label='Checklist designer'>
        <button type='button' disabled={!canEdit} onClick={() => context.submitEdits([{ kind: SceneEditKind.SetProperty, nodeId: context.element.id, path: 'title', value: 'Site inspection' }])}>
            Use default title
        </button>
        <button type='button' disabled={!canEdit} onClick={() => context.submitAction(generateChecklistItemsActionId, [])}>
            Generate fields
        </button>
    </div>;
}
