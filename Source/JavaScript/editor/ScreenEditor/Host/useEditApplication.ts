// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback } from 'react';
import type { SceneEdit } from '@cratis/scene.model';
import type { EditingContext } from '@cratis/scene.engine';
import { applyAllToSession, applyToSession, type ScreenEditSession } from '../Session/EditSession';
import type { SessionCell } from '../Session/SessionCell';

export const useEditApplication = (cell: SessionCell, commit: (change: (current: ScreenEditSession) => ScreenEditSession) => ScreenEditSession, context: EditingContext) => {
    const tryApply = useCallback((edit: SceneEdit, label: string) => {
        const before = cell.current;
        const outcome = commit(current => applyToSession(current, edit, context, label));
        return { applied: outcome.undoable.length > before.undoable.length || outcome.document !== before.document, diagnostics: outcome.diagnostics };
    }, [cell, commit, context]);

    const apply = useCallback((edit: SceneEdit, label: string) => { tryApply(edit, label); }, [tryApply]);

    const applyAll = useCallback((edits: SceneEdit[], label: string) => {
        const before = cell.current;
        const outcome = commit(current => applyAllToSession(current, edits, context, label));
        return { applied: outcome.document !== before.document, diagnostics: outcome.diagnostics };
    }, [cell, commit, context]);

    return { tryApply, apply, applyAll };
};
