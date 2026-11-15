// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { CrashPanel } from './CrashPanel';
import type { CrashStrings } from './CrashStrings';
import type { CrashContext } from './crashReport';

export interface CrashBoundaryProps {
    /** What is guarded - shown in the panel and written into the report. */
    context: CrashContext;

    /** Leaves what is guarded; without it the panel has no "Close". */
    onClose?: (() => void) | undefined;

    /** `fixed` covers the page; `fill` fills the box the boundary is drawn in. */
    layout?: 'fixed' | 'fill';

    /** Values identifying what is guarded: the boundary recovers by itself when any of them changes. */
    resetKeys?: readonly unknown[];

    /** Called with the error and the component stack once the crash is on screen, so a host can record it. */
    onCrash?: (error: Error, componentStack: string | null | undefined) => void;

    strings?: CrashStrings;
    children: ReactNode;
}

interface CrashBoundaryState {
    error: Error | null;
    componentStack: string | null | undefined;
    attempt: number;
    resetSignature: string;
}

const signatureOf = (keys?: readonly unknown[]) => (keys ?? []).map(String).join('|');

/**
 * Catches an error thrown while drawing what it guards and draws the {@link CrashPanel} in its place - what failed, Reload, Try again, Close and
 * "Report this error" - so a crash is never a blank page. Scope it tightly: around a preview, an editor, a lazily loaded page.
 */
export class CrashBoundary extends Component<CrashBoundaryProps, CrashBoundaryState> {
    state: CrashBoundaryState = { error: null, componentStack: undefined, attempt: 0, resetSignature: signatureOf(this.props.resetKeys) };

    static getDerivedStateFromError(error: Error): Partial<CrashBoundaryState> {
        return { error };
    }

    static getDerivedStateFromProps(props: CrashBoundaryProps, state: CrashBoundaryState): CrashBoundaryState | null {
        const signature = signatureOf(props.resetKeys);
        return signature === state.resetSignature ? null : { error: null, componentStack: undefined, attempt: state.attempt + 1, resetSignature: signature };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error(`Crash caught by the boundary of ${this.props.context.surface}:`, error, info.componentStack);
        this.setState({ componentStack: info.componentStack });
        this.props.onCrash?.(error, info.componentStack);
    }

    render(): ReactNode {
        const { error, componentStack, attempt } = this.state;
        if (error) {
            return <CrashPanel error={error} componentStack={componentStack} context={this.props.context} layout={this.props.layout ?? 'fixed'}
                onClose={this.props.onClose} onRecover={this.recover} {...(this.props.strings ? { strings: this.props.strings } : {})} />;
        }

        return <Attempt key={attempt}>{this.props.children}</Attempt>;
    }

    private readonly recover = (): void => {
        this.setState(state => ({ error: null, componentStack: undefined, attempt: state.attempt + 1 }));
    };
}

// Keyed so recovering remounts the guarded subtree instead of re-rendering the state that crashed.
const Attempt = ({ children }: { children: ReactNode }) => <>{children}</>;
