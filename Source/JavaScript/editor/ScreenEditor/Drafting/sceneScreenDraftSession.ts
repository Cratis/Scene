// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { EditingContext } from '@cratis/scene.engine';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import { applyAllToSession } from '../Session/EditSession';
import type { SessionCell } from '../Session/SessionCell';
import { prepareSceneScreenDraft } from './prepareSceneScreenDraft';
import type { PreparedSceneScreenDraft } from './SceneScreenDraft';
import type { SceneScreenDraftStrings } from './SceneScreenDraftStrings';
import { defaultSceneScreenDraftStrings } from './defaultSceneScreenDraftStrings';

// The same latest-cell boundary is used by preview and Apply, including before React rerenders.
export function sceneScreenDraftSession(cell: SessionCell, runtime: ScreenEditorRuntime, context: EditingContext, text: SceneScreenDraftStrings = defaultSceneScreenDraftStrings) {
    const current = (draft: PreparedSceneScreenDraft) => draft.base === cell.current.document && draft.runtime === runtime && draft.context === context;
    return {
        isSceneScreenDraftCurrent: current,
        prepareSceneScreenDraft: (answer: string, parameterlessQueryIds: readonly string[]) => prepareSceneScreenDraft(cell.current.document, answer, { runtime, context, parameterlessQueryIds }),
        applySceneScreenDraft: (draft: PreparedSceneScreenDraft) => {
            if (!current(draft)) return { applied: false, problem: text.changed };
            const checked = prepareSceneScreenDraft(cell.current.document, draft.answer, { runtime, context, parameterlessQueryIds: draft.parameterlessQueryIds });
            if (!checked.prepared) return { applied: false, problem: checked.problem };
            const before = cell.current.document;
            const outcome = cell.commit(session => session.document === checked.prepared.base ? applyAllToSession(session, checked.prepared.edits, context, text.undoLabel) : session);
            return outcome.document !== before ? { applied: true } : { applied: false, problem: text.applyFailed };
        },
    };
}
