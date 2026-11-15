// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { DesignCanvasHost, DesignStringKey } from './DesignCanvasHost';
import { designStringsOf } from './defaultDesignStrings';

const HostContext = createContext<DesignCanvasHost | undefined>(undefined);

export interface DesignCanvasHostProviderProps {
    host: DesignCanvasHost;
    children: ReactNode;
}

/** Lends the canvas' parts the host they are mounted in, so they never reach for anything of the application around them. */
export const DesignCanvasHostProvider = ({ host, children }: DesignCanvasHostProviderProps) =>
    <HostContext.Provider value={host}>{children}</HostContext.Provider>;

/** The host the canvas is mounted in. */
export function useDesignCanvasHost(): DesignCanvasHost {
    const host = useContext(HostContext);
    if (host === undefined) throw new Error('The design canvas is used outside a DesignCanvasHostProvider.');
    return host;
}

/** The words of the canvas: the host's, then the defaults. */
export function useDesignStrings(): Record<DesignStringKey, string> {
    const host = useDesignCanvasHost();
    return useMemo(() => designStringsOf(host.strings), [host.strings]);
}
