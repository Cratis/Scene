// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext } from 'react';
import { BindingScope } from '@cratis/scene.engine';
import { DestinationReference } from '@cratis/scene.model';
import { DestinationResolution } from './DestinationResolution';

export interface SceneNavigationContextValue {
    currentScreen: string;
    currentUrl?: string;
    currentOutlet?: string;
    currentDialog?: string;
    bindingScope: BindingScope;
    navigate(destination: DestinationReference): DestinationResolution;
    closeDialog(): void;
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
