// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { MouseEvent, ReactNode, createContext, useCallback, useContext, useMemo } from 'react';
import { DestinationKind, DestinationReference } from '@cratis/scene.model';
import { NavigationActivation, NavigationActivationRequest } from './NavigationActivation';
import { NavigationMode } from './NavigationMode';
import { SceneNavigationContextInternal } from './SceneNavigationContext';
import { SceneOutletContext } from './SceneOutletContext';

/** What a host decides about the controls that navigate. */
export interface NavigationActivationPolicy {
    /**
     * `navigate` (the default) opens the destination in its slot; `select` only reports the activation. A function decides per
     * activation, with the click that caused it when there was one.
     */
    mode?: NavigationMode | ((request: NavigationActivationRequest, event?: Pick<MouseEvent, 'altKey' | 'metaKey' | 'ctrlKey' | 'shiftKey'>) => NavigationMode);

    /** Whether an Alt-click selects without navigating, whatever `mode` says; true by default. */
    altSelects?: boolean;

    /** Called for every activation, whether it navigated or not - a design host selects the item here. */
    onActivate?(activation: NavigationActivation): void;

    /** Called after the host has opened a destination. */
    onNavigate?(destination: DestinationReference, activation: NavigationActivation): void;

    /**
     * Whether the host leaves the screen a destination names out on purpose - a preview scoped to one slice draws only that slice's
     * screens. Such a destination is not a problem (it resolves, so no `navTargetMissing` marker is drawn for it) but is not opened
     * either: the activation is reported with `navigated` false.
     */
    leftOut?(destination: DestinationReference): boolean;
}

const PolicyContext = createContext<NavigationActivationPolicy | undefined>(undefined);

export interface NavigationActivationProviderProps extends NavigationActivationPolicy {
    children?: ReactNode;
}

/**
 * Tells the navigating controls below it how a host wants their activation handled - the hook with which a design host intercepts
 * clicks (`mode="select"`, or Alt-click) and learns of every navigation (`onNavigate`). Without one, controls navigate.
 */
export function NavigationActivationProvider({ children, mode, altSelects, onActivate, onNavigate, leftOut }: NavigationActivationProviderProps) {
    const value = useMemo(() => ({ mode, altSelects, onActivate, onNavigate, leftOut }), [altSelects, leftOut, mode, onActivate, onNavigate]);
    return <PolicyContext.Provider value={value}>{children}</PolicyContext.Provider>;
}

/** What {@link useNavigationActivation} gives a navigating control. */
export interface NavigationActivator {
    /** Whether a navigation host is in scope; outside one a control keeps its plain link. */
    hosted: boolean;

    /** Whether a destination exists in the host: it names a screen the host renders, or opens a dialog or an external target. */
    resolves(destination: DestinationReference | undefined): boolean;

    /** Activates a control: selects or navigates as the host's policy says, and reports it. */
    activate(request: NavigationActivationRequest, event?: Pick<MouseEvent, 'altKey' | 'metaKey' | 'ctrlKey' | 'shiftKey'>): NavigationActivation;
}

/**
 * The one way a control navigates (spec N1, N2, N8): through the navigation context of the enclosing host - so the destination is
 * rendered in its slot, the history records it and the address of the page that hosts the application is never written - after
 * the host's {@link NavigationActivationPolicy} had its say. A destination that does not resolve is reported, never opened.
 */
export function useNavigationActivation(): NavigationActivator {
    const navigation = useContext(SceneNavigationContextInternal);
    const outlets = useContext(SceneOutletContext);
    const policy = useContext(PolicyContext);
    const screens = outlets?.screens;

    const resolves = useCallback((destination: DestinationReference | undefined): boolean => {
        if (destination === undefined) return false;
        if (destination.kind === DestinationKind.Dialog || destination.dialog || destination.kind === DestinationKind.External) return true;
        const screen = destination.screen ?? destination.slice;
        if (screen === undefined || screen === '') return false;
        return screens === undefined || screen in screens || policy?.leftOut?.(destination) === true;
    }, [policy, screens]);

    const activate = useCallback((request: NavigationActivationRequest, event?: Pick<MouseEvent, 'altKey' | 'metaKey' | 'ctrlKey' | 'shiftKey'>): NavigationActivation => {
        const requested = typeof policy?.mode === 'function' ? policy.mode(request, event) : policy?.mode ?? 'navigate';
        const mode: NavigationMode = requested === 'navigate' && event?.altKey && (policy?.altSelects ?? policy !== undefined) ? 'select' : requested;
        const destination = request.destination;
        const found = resolves(destination);

        let activation: NavigationActivation = { request, mode, resolves: found, navigated: false };
        const opens = found && destination !== undefined && (screens === undefined || destination.kind === DestinationKind.Dialog || destination.dialog || destination.kind === DestinationKind.External || (destination.screen ?? destination.slice ?? '') in screens);
        if (mode === 'navigate' && opens && destination) {
            if (navigation) {
                activation = { ...activation, navigated: true, resolution: navigation.navigate(destination) };
            } else {
                globalThis.dispatchEvent(new CustomEvent('cratis.scene.navigate', { detail: { targetScreen: destination.screen ?? '', destination, item: request.item } }));
            }
        }

        policy?.onActivate?.(activation);
        if (activation.navigated && destination) policy?.onNavigate?.(destination, activation);
        return activation;
    }, [navigation, policy, resolves, screens]);

    return useMemo(() => ({ hosted: navigation !== undefined, resolves, activate }), [activate, navigation, resolves]);
}
