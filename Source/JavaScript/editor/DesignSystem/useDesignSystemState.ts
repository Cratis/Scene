// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DesignSystemHost, DesignSystemState } from './DesignSystemHost';

/** Whether the design system has been read. */
export type DesignSystemLoadStatus = 'loading' | 'ready' | 'failed';

/**
 * Reads the design system from the host when the editor opens and again whenever asked. A failed read after a successful one
 * keeps what was read: the editor shows the last state it knew rather than go blank under a person's hands.
 *
 * @param host The host.
 * @param initial A state to start from, so nothing is shown loading - what a host that already has it or a story passes.
 * @returns The state, whether it has been read, and how to read it again.
 */
export const useDesignSystemState = (host: DesignSystemHost, initial?: DesignSystemState) => {
    const [state, setState] = useState<DesignSystemState | undefined>(initial);
    const [status, setStatus] = useState<DesignSystemLoadStatus>(initial === undefined ? 'loading' : 'ready');
    const mounted = useRef(true);
    const known = useRef(initial !== undefined);

    const reload = useCallback(async () => {
        try {
            const loaded = await host.load();
            if (!mounted.current) return;
            known.current = true;
            setState(loaded);
            setStatus('ready');
        } catch {
            if (mounted.current && !known.current) setStatus('failed');
        }
    }, [host]);

    useEffect(() => {
        mounted.current = true;
        if (initial === undefined) void reload();
        return () => { mounted.current = false; };
        // The editor opens on the host it was given; a new host is a new editor.
    }, [host]);

    const retry = useCallback(() => {
        setStatus('loading');
        return reload();
    }, [reload]);

    return { state, status, reload, retry };
};
