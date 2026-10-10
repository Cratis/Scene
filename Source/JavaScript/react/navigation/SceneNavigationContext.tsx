// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext } from 'react';
import { BindingScope } from '@cratis/scene.engine';
import { DestinationReference } from '@cratis/scene.model';
import { DestinationResolution } from './DestinationResolution';
import { DialogResult } from './DialogResult';

export interface SceneNavigationContextValue {
    currentScreen: string;
    currentUrl?: string;
    currentOutlet?: string;
    currentDialog?: string;

    /** The route parameters of the current entry - from the destination that opened it, or the deep link. */
    currentParameters: Record<string, string>;

    /** What the last dialog returned when it closed. */
    dialogResult?: DialogResult;

    /** A deep link that matched no route; the host fell back to its initial screen. */
    unresolvedUrl?: string;
    bindingScope: BindingScope;
    navigate(destination: DestinationReference): DestinationResolution;

    /** Closes the open dialog, returning to the entry that opened it, and records its result. */
    closeDialog(result?: unknown): void;

    /** Goes back one history entry. */
    back(): void;
}

const Context = createContext<SceneNavigationContextValue | undefined>(undefined);

export interface SceneNavigationProviderProps {
    value: SceneNavigationContextValue;
    children: ReactNode;
}

export function SceneNavigationProvider({ value, children }: SceneNavigationProviderProps) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSceneNavigation(): SceneNavigationContextValue {
    const context = useContext(Context);
    if (!context) throw new Error('No Scene navigation context is available.');
    return context;
}
