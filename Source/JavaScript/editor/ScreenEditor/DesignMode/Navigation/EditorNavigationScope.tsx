// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo, type ReactNode } from 'react';
import type { ApplicationStructure, DestinationReference, NavigationModel } from '@cratis/scene.model';
import { DestinationKind } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { EditorLogoContext, type EditorLogo } from './EditorLogoContext';
import { SceneNavigationModelProvider, SceneNavigationProvider, SliceInvokerProvider, createDryRunInvoker, type SceneNavigationContextValue } from '@cratis/scene.react';

// While a screen is designed nothing is invoked: a toolbar button that would invoke a slice is drawn with its warning when it has none (TB5), and a press only selects it.
const designInvoker = createDryRunInvoker();

const noNavigation = (): never => { throw new Error('The screen is being designed; it does not navigate.'); };

export interface EditorNavigationScopeProps {
    structure: ApplicationStructure;
    navigation: NavigationModel;

    // The module being edited; nothing at the application level.
    module: string | undefined;
    logoLockedReason: string;

    // Where a click on a navigation entry of the application's shell goes: the editor does not navigate, so the host peeks at the destination
    // (spec N2). Without it a click on an entry of the screen being edited is a mistake and says so.
    onNavigate?: (destination: DestinationReference) => void;

    // The screen the shell shows as current while a destination is peeked at.
    peeking?: string;
    children: ReactNode;
}

// Gives the topbar and the sidebar on the surface the navigation of the application and the level being edited, so they draw what Scene resolves for it - the
// same `effectiveNavigation` Stage and the preview use (REN2) - and not a copy of the rules. The page the surface is "on" is the first feature of the module, which
// is how a region knows which module it is drawing; nothing navigates while the screen is designed.
export const EditorNavigationScope = ({ structure, navigation, module, logoLockedReason, onNavigate, peeking, children }: EditorNavigationScopeProps) => {
    const index = useMemo(() => new ApplicationStructureIndex(structure), [structure]);
    const model = useMemo(() => ({ structure: index, navigation }), [index, navigation]);
    const own = module === undefined ? undefined : index.firstFeatureId(module) ?? `${module}.`;
    const screen = peeking || own;
    const value = useMemo<SceneNavigationContextValue | undefined>(() => screen === undefined && onNavigate === undefined ? undefined : ({
        currentScreen: screen ?? '', primaryScreen: screen ?? '', slots: {}, currentParameters: {}, bindingScope: {},
        navigate: onNavigate
            ? destination => { onNavigate(destination); return { kind: destination.kind ?? DestinationKind.Slot, parameters: {}, action: 'navigate', diagnostics: [] }; }
            : noNavigation,
        closeDialog: noNavigation, closeSlot: noNavigation, back: noNavigation,
    }), [screen, onNavigate]);

    const applicationLogo = navigation.application.logo;
    const logo = useMemo<EditorLogo | undefined>(() => applicationLogo ? { title: applicationLogo.title, locked: module !== undefined, lockedReason: logoLockedReason } : undefined, [applicationLogo, module, logoLockedReason]);

    // An application the editor knows nothing of has no regions to draw - unless the shell is around the screen, which navigates by itself.
    if (structure.modules.length === 0 && !onNavigate) return <>{children}</>;
    const inner = <EditorLogoContext.Provider value={logo}><SceneNavigationModelProvider model={model}><SliceInvokerProvider invoker={designInvoker} warnEmptySlices>{children}</SliceInvokerProvider></SceneNavigationModelProvider></EditorLogoContext.Provider>;
    return value ? <SceneNavigationProvider value={value}>{inner}</SceneNavigationProvider> : inner;
};
