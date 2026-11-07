// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BindingScope } from '@cratis/scene.engine';
import { DestinationKind, DestinationReference } from '@cratis/scene.model';
import { DialogResult } from './DialogResult';
import { matchSceneRoute } from './matchSceneRoute';
import { placeInSlot } from './placeInSlot';
import { resolveDestination } from './resolveDestination';
import { SceneHistory } from './SceneHistory';
import { SceneNavigationContextValue } from './SceneNavigationContext';
import { SceneNavigationState } from './SceneNavigationState';
import { SceneRoute } from './SceneRoute';

/**
 * Keeps a navigation host's state in a {@link SceneHistory}: every navigation and every dialog is an entry,
 * so back and forward step through them, a refresh restores the stored entry, and a deep link is matched
 * against the route table. Closing a dialog goes back to the entry that opened it.
 */
export function useSceneHistoryNavigation(
    history: SceneHistory,
    routes: SceneRoute[],
    initialScreen: string,
    bindingScope: BindingScope,
    slotOwners: Record<string, string> = {},
    destinations: DestinationReference[] = [],
): SceneNavigationContextValue {
    const fromLocation = useCallback((url: string | undefined): SceneNavigationState | undefined => {
        const match = url ? matchSceneRoute(url, routes) : undefined;
        if (!match) return undefined;
        const start: SceneNavigationState = { screen: initialScreen, parameters: {} };
        const placement = placeInSlot(start, match.route.screen, match.route.slot, slotOwners, destinations);
        return { screen: match.route.screen, url, slot: match.route.slot, parameters: match.parameters, ...placement };
    }, [destinations, initialScreen, slotOwners, routes]);
    const fallback = useMemo<SceneNavigationState>(() => ({ screen: initialScreen, url: initialScreen, parameters: {} }), [initialScreen]);

    const [unresolvedUrl] = useState(() => {
        const url = history.location();
        return !history.state() && url && !fromLocation(url) ? url : undefined;
    });
    const [state, setState] = useState<SceneNavigationState>(() => history.state() ?? fromLocation(history.location()) ?? fallback);
    const [dialogResult, setDialogResult] = useState<DialogResult>();

    // Back and forward restore the stored entry, or match a URL the host never wrote against the current routes.
    const restore = useRef((url: string | undefined, stored: SceneNavigationState | undefined) => stored ?? fromLocation(url) ?? fallback);
    restore.current = (url, stored) => stored ?? fromLocation(url) ?? fallback;
    const initialState = useRef(state);

    // The current entry is written once, when a history is attached; later entries are written by navigate.
    useEffect(() => {
        history.replace(initialState.current);
        return history.listen((url, stored) => setState(restore.current(url, stored)));
    }, [history]);

    const go = useCallback((next: SceneNavigationState) => {
        history.push(next);
        setState(next);
    }, [history]);

    const navigate = useCallback((destination: DestinationReference) => {
        const resolution = resolveDestination(destination, bindingScope);
        if (resolution.kind === DestinationKind.Dialog) {
            if (resolution.dialog) go({ ...state, dialog: resolution.dialog, dialogParameters: resolution.parameters });
        } else if (resolution.kind !== DestinationKind.External) {
            const screen = destination.screen ?? destination.slice ?? state.screen;
            const placement = placeInSlot(state, screen, resolution.slot, slotOwners, destinations);
            go({ screen, url: resolution.url, slot: resolution.slot, parameters: resolution.parameters, ...placement });
        }

        return resolution;
    }, [bindingScope, destinations, go, slotOwners, state]);

    const closeDialog = useCallback((result?: unknown) => {
        if (!state.dialog) return;
        setDialogResult({ dialog: state.dialog, result });
        history.back();
    }, [history, state.dialog]);

    const closeSlot = useCallback((name: string) => {
        if (state.slots?.[name] === undefined) return;
        const { [name]: _closed, ...remaining } = state.slots;
        const primary = state.primary ?? state.screen;
        const own = routes.find(route => route.screen === primary && route.slot === undefined);
        go({ screen: primary, primary, slots: remaining, url: own?.route ?? primary, parameters: {} });
    }, [go, routes, state]);

    return useMemo(() => ({
        currentScreen: state.screen,
        primaryScreen: state.primary ?? state.screen,
        slots: state.slots ?? {},
        currentUrl: state.url,
        currentSlot: state.slot,
        currentDialog: state.dialog,
        currentDialogParameters: state.dialogParameters,
        currentParameters: state.parameters,
        dialogResult,
        unresolvedUrl,
        bindingScope,
        navigate,
        closeDialog,
        closeSlot,
        back: () => history.back(),
    }), [bindingScope, closeDialog, closeSlot, dialogResult, history, navigate, state, unresolvedUrl]);
}
