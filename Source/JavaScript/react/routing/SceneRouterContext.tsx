// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, ReactNode, useContext } from 'react';
import { SceneRouter, SceneRouteState } from './SceneRouter';
import { useMemorySceneRouter } from './useMemorySceneRouter';

const Context = createContext<SceneRouter | undefined>(undefined);

export interface SceneRouterProviderProps {
    /** The host's router. Absent, the provider keeps the route state in memory, shared by everything inside it. */
    router?: SceneRouter;

    /** The state an in-memory router starts from; ignored when a router is given. */
    initialState?: SceneRouteState;

    children: ReactNode;
}

function MemorySceneRouterProvider({ initialState, children }: { initialState?: SceneRouteState; children: ReactNode }) {
    const router = useMemorySceneRouter(initialState);
    return <Context.Provider value={router}>{children}</Context.Provider>;
}

/**
 * Gives everything inside it the router routed slots, tabs and filters read and write: the host's own (Stage maps it to
 * its URL), or one that keeps the state in memory.
 */
export function SceneRouterProvider({ router, initialState, children }: SceneRouterProviderProps) {
    return router
        ? <Context.Provider value={router}>{children}</Context.Provider>
        : <MemorySceneRouterProvider initialState={initialState}>{children}</MemorySceneRouterProvider>;
}

/** The router of the enclosing provider, or undefined outside one. */
export function useOptionalSceneRouter(): SceneRouter | undefined {
    return useContext(Context);
}

/**
 * The router of the enclosing provider. Outside one, a router of this component's own that keeps the state in memory, so
 * a control rendered on its own still works.
 */
export function useSceneRouter(): SceneRouter {
    const router = useContext(Context);
    const fallback = useMemorySceneRouter();
    return router ?? fallback;
}
