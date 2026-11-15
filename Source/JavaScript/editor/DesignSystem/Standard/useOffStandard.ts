// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import type { DesignSystemRefusal, DesignSystemStandardHost } from '../DesignSystemHost';
import { issueFor, offStandardEntries, replacementFor, type OffStandardEntry } from './offStandard';

/**
 * What the designs have outside the design system, and the ways of bringing it back. Read when the editor first asks, and
 * again after something was done about it.
 *
 * @param host What finds it and acts on it; absent when the host cannot, which leaves nothing to show.
 * @param strings The words to use.
 * @param watching Whether anything is showing what is off the standard - nothing is read while nobody looks.
 * @returns What is off the standard and the actions on it.
 */
export const useOffStandard = (host: DesignSystemStandardHost | undefined, strings: DesignSystemEditorStrings, watching: boolean) => {
    const [entries, setEntries] = useState<OffStandardEntry[] | undefined>();
    const mounted = useRef(true);

    const read = useCallback(async () => {
        if (host === undefined) return;
        try {
            const screens = await host.find();
            if (mounted.current) setEntries(offStandardEntries(screens));
        } catch {
            if (mounted.current) setEntries([]);
        }
    }, [host]);

    useEffect(() => {
        mounted.current = true;
        if (watching && entries === undefined) void read();
        return () => { mounted.current = false; };
    }, [watching, entries, read]);

    const afterwards = async (refusal: DesignSystemRefusal): Promise<DesignSystemRefusal> => {
        if (refusal === undefined) await read();
        return refusal;
    };

    return {
        entries: entries ?? [],
        isReady: entries !== undefined,
        canRaiseIssue: host?.raiseIssue !== undefined,
        canUseToken: host?.useToken !== undefined,
        canPropose: host?.propose !== undefined,
        raiseIssue: async (chosen: readonly OffStandardEntry[]): Promise<DesignSystemRefusal> =>
            host?.raiseIssue === undefined || chosen.length === 0 ? undefined : afterwards(await host.raiseIssue(issueFor(chosen, strings.standard))),
        useToken: async (entry: OffStandardEntry): Promise<DesignSystemRefusal> =>
            host?.useToken === undefined || entry.suggestion === '' ? undefined : afterwards(await host.useToken(entry, replacementFor(entry.suggestion))),
        propose: async (entry: OffStandardEntry): Promise<DesignSystemRefusal> =>
            host?.propose === undefined ? undefined : afterwards(await host.propose(entry)),
    };
};

/** What the hook gives. */
export type OffStandardState = ReturnType<typeof useOffStandard>;
