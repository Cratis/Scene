// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext } from 'react';
import { SceneNavigationModel } from './SceneNavigationModel';

const Context = createContext<SceneNavigationModel | undefined>(undefined);

export interface SceneNavigationModelProviderProps {
    model: SceneNavigationModel;
    children?: ReactNode;
}

/**
 * Supplies the application structure and navigation every navigation region below it renders - the topbar and sidebar
 * components of a shell find what to show here, so a screen document does not carry the application's navigation.
 */
export function SceneNavigationModelProvider({ model, children }: SceneNavigationModelProviderProps) {
    return <Context.Provider value={model}>{children}</Context.Provider>;
}

/** The navigation model in scope, or undefined outside a {@link SceneNavigationModelProvider}. */
export function useSceneNavigationModel(): SceneNavigationModel | undefined {
    return useContext(Context);
}
