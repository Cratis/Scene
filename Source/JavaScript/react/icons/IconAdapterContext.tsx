// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext } from 'react';
import { IconAdapterRegistry } from './IconAdapterRegistry';

const IconAdapterContext = createContext<IconAdapterRegistry | undefined>(undefined);

/**
 * Supplies the icon adapters every `SceneIcon` below it renders through.
 */
export const IconAdapterProvider = ({ registry, children }: { registry: IconAdapterRegistry; children?: ReactNode }) => (
    <IconAdapterContext.Provider value={registry}>{children}</IconAdapterContext.Provider>
);

/**
 * The icon adapters in scope, or `undefined` outside an {@link IconAdapterProvider}.
 */
export function useIconAdapters(): IconAdapterRegistry | undefined {
    return useContext(IconAdapterContext);
}
