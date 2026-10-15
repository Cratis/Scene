// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Where one step of an approval chain stands. */
export enum ApprovalState {
    Pending = 'pending',
    Current = 'current',
    Approved = 'approved',
    Rejected = 'rejected',
    Skipped = 'skipped',
}

/** One step of an approval chain: who decides, and what they decided. */
export interface ApprovalStep {
    label: string;
    approver?: string;
    state: ApprovalState;
    at?: string;
    comment?: string;
}

/** A step as it is drawn, after the chain's own rules are applied. */
export interface EffectiveStep extends ApprovalStep {
    /** True when an earlier rejection stopped the chain before this step was reached. */
    notReached: boolean;
}

/** How the chain as a whole stands. */
export enum ChainOutcome {
    /** Every step approved. */
    Approved = 'approved',

    /** A step rejected: the chain stops there. */
    Rejected = 'rejected',

    /** At least one step is decided and the rest are waiting. */
    InProgress = 'inProgress',

    /** Nothing decided yet. */
    Pending = 'pending',
}

/** Reads steps out of a property value, dropping entries without a label; an unknown state is pending. */
export function readSteps(value: unknown): ApprovalStep[] {
    if (!Array.isArray(value)) return [];

    return value.flatMap((entry): ApprovalStep[] => {
        if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) return [];
        const { label, approver, state, at, comment } = entry as Record<string, unknown>;
        if (typeof label !== 'string' || label.length === 0) return [];

        return [{
            label,
            state: (Object.values(ApprovalState) as string[]).includes(state as string) ? (state as ApprovalState) : ApprovalState.Pending,
            ...(typeof approver === 'string' ? { approver } : {}),
            ...(typeof at === 'string' ? { at } : {}),
            ...(typeof comment === 'string' && comment.length > 0 ? { comment } : {}),
        }];
    });
}

/**
 * Applies the chain's rules to the steps as written.
 *
 * A rejection stops the chain: every step after the first rejected one has not been reached, so it is drawn skipped however it was written.
 * With no step marked current and no rejection, the first step that is not yet decided is the current one - the person the chain is waiting
 * for - so a chain written only as approved and pending steps still says whose turn it is. Only one step is ever current.
 */
export function effectiveSteps(steps: ApprovalStep[]): EffectiveStep[] {
    const rejected = steps.findIndex(step => step.state === ApprovalState.Rejected);
    const explicitCurrent = steps.findIndex(step => step.state === ApprovalState.Current);
    const waiting = rejected >= 0 ? -1 : explicitCurrent >= 0 ? explicitCurrent : steps.findIndex(step => step.state === ApprovalState.Pending);

    return steps.map((step, index) => {
        if (rejected >= 0 && index > rejected) return { ...step, state: ApprovalState.Skipped, notReached: true };
        if (step.state === ApprovalState.Current && index !== waiting) return { ...step, state: ApprovalState.Pending, notReached: false };
        if (index === waiting && step.state === ApprovalState.Pending) return { ...step, state: ApprovalState.Current, notReached: false };
        return { ...step, notReached: false };
    });
}

/** The state of the chain as a whole. A skipped step counts as decided, because it was never going to be asked. */
export function chainOutcome(steps: ApprovalStep[]): ChainOutcome {
    const effective = effectiveSteps(steps);
    if (effective.some(step => step.state === ApprovalState.Rejected)) return ChainOutcome.Rejected;
    if (effective.length > 0 && effective.every(step => step.state === ApprovalState.Approved || step.state === ApprovalState.Skipped)) return ChainOutcome.Approved;
    return effective.some(step => step.state === ApprovalState.Approved) ? ChainOutcome.InProgress : ChainOutcome.Pending;
}
