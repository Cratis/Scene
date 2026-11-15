// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ScenePackageBundle } from '@cratis/scene.react';
import { resolveUiProfile } from '../../UiProfile/resolveUiProfile';
import type { ResolvedUiProfile } from '../../UiProfile/ResolvedUiProfile';
import { areDesignedProfilesEqual, type DesignedProfile } from './DesignedProfile';
import { AutosaveController, defaultAutosaveDelay, type AutosaveOutcome } from '../Autosave/AutosaveController';
import { SaveState } from '../Autosave/SaveState';
import {
    canRedoProfile,
    canUndoProfile,
    changeProfile,
    markProfileSaved,
    nextRedoLabel,
    nextUndoLabel,
    openProfileSession,
    redoProfile,
    undoProfile,
    type ProfileSession,
} from './ProfileSession';

export interface ProfileDesignerInput {
    // The profile as stored, or the default one for an application that never stored one. The designer is opened once this has arrived.
    opened: DesignedProfile;
    bundles: ScenePackageBundle[];

    // Stores the profile. Rejecting, or resolving unsuccessfully, keeps the edit and offers a retry.
    onSave: (settings: DesignedProfile) => Promise<AutosaveOutcome>;

    delay?: number;
}

export interface ProfileDesigner {
    settings: DesignedProfile;
    resolved: ResolvedUiProfile;
    saveState: SaveState;
    saveMessages: string[];

    // Applies one edit as one undo step, labelled for "Undo <label>".
    edit: (next: DesignedProfile, label: string) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    undoLabel: string | undefined;
    redoLabel: string | undefined;
    retry: () => void;
}

// The profile being designed: its history, the settings resolved by Scene's resolver, and the autosave that stores every edit. The history and
// the autosave are plain objects (`ProfileSession`, `AutosaveController`); this hook only holds them in React state and ties their lifetime to the window.
export function useProfileDesigner({ opened, bundles, onSave, delay = defaultAutosaveDelay }: ProfileDesignerInput): ProfileDesigner {
    const [session, setSession] = useState<ProfileSession<DesignedProfile>>(() => openProfileSession(opened, areDesignedProfilesEqual));
    const [saveState, setSaveState] = useState(SaveState.Saved);
    const [saveMessages, setSaveMessages] = useState<string[]>([]);

    const save = useRef(onSave);
    save.current = onSave;

    const controller = useMemo(() => {
        const created = new AutosaveController<DesignedProfile>(
            settings => save.current(settings),
            (state, messages) => {
                setSaveState(state);
                setSaveMessages(messages);
                if (state === SaveState.Saved) setSession(previous => markProfileSaved(previous));
            },
            delay,
            undefined,
            areDesignedProfilesEqual);
        created.reset(opened);
        return created;
        // The controller is made once for the profile that was opened.
    }, []);

    useEffect(() => { controller.edited(session.document); }, [controller, session.document]);

    // Leaving the page stores what is still waiting rather than dropping it.
    useEffect(() => {
        const leave = () => { void controller.flush(); };
        window.addEventListener('beforeunload', leave);
        return () => {
            window.removeEventListener('beforeunload', leave);
            void controller.flush().finally(() => controller.stop());
        };
    }, [controller]);

    const resolved = useMemo(() => resolveUiProfile(session.document, bundles), [session.document, bundles]);

    const edit = useCallback((next: DesignedProfile, label: string) => setSession(previous => changeProfile(previous, next, label)), []);
    const undo = useCallback(() => setSession(undoProfile), []);
    const redo = useCallback(() => setSession(redoProfile), []);
    const retry = useCallback(() => { void controller.retry(); }, [controller]);

    return {
        settings: session.document,
        resolved,
        saveState,
        saveMessages,
        edit,
        undo,
        redo,
        canUndo: canUndoProfile(session),
        canRedo: canRedoProfile(session),
        undoLabel: nextUndoLabel(session),
        redoLabel: nextRedoLabel(session),
        retry,
    };
}
