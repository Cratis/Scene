// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext } from 'react';
import { DesignTimeContext } from './DesignTimeContext';

const Context = createContext<DesignTimeContext | undefined>(undefined);

export interface DesignTimeProviderProps {
    context: DesignTimeContext;
    children: ReactNode;
}

/**
 * Makes the generic package-side design-time context available to nested package components.
 */
export function DesignTimeProvider({ context, children }: DesignTimeProviderProps) {
    return <Context.Provider value={context}>{children}</Context.Provider>;
}

export function useDesignTimeContext(): DesignTimeContext {
    const context = useContext(Context);
    if (!context) throw new Error('No Scene design-time context is available.');
    return context;
}
