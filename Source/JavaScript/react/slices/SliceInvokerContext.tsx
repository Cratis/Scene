// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useContext, useMemo } from 'react';
import { createAnnouncingInvoker } from './createAnnouncingInvoker';
import { SliceInvoker } from './SliceInvoker';

interface SliceInvokerScope {
    invoker: SliceInvoker;
    warnEmptySlices: boolean;
}

const announcing = createAnnouncingInvoker();
const defaultScope: SliceInvokerScope = { invoker: announcing, warnEmptySlices: false };
const Context = createContext<SliceInvokerScope>(defaultScope);

export interface SliceInvokerProviderProps {
    /** The invoker toolbar dialogs submit through. */
    invoker: SliceInvoker;

    /**
     * Whether a toolbar button without a slice shows a warning badge. Design and preview hosts turn it on (TB5); a
     * running application never shows it. A dry-run invoker implies it.
     */
    warnEmptySlices?: boolean;
    children?: ReactNode;
}

/**
 * Supplies the `sliceInvoker` every toolbar dialog below it submits through: a real one in Stage, a dry-run one in the Studio
 * preview. Without a provider the command is announced as `cratis.scene.command`.
 */
export function SliceInvokerProvider({ invoker, warnEmptySlices, children }: SliceInvokerProviderProps) {
    const warn = warnEmptySlices ?? (invoker as { dryRun?: boolean }).dryRun === true;
    const value = useMemo(() => ({ invoker, warnEmptySlices: warn }), [invoker, warn]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}

/** The invoker in scope: the provider's, or the one that announces the command. */
export function useSliceInvoker(): SliceInvoker {
    return useContext(Context).invoker;
}

/** Whether a button without a slice should show a warning badge here. */
export function useWarnEmptySlices(): boolean {
    return useContext(Context).warnEmptySlices;
}
