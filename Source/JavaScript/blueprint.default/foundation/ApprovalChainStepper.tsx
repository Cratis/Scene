// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ApprovalState, ChainOutcome, chainOutcome, effectiveSteps, readSteps } from './approvalModel';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationIcon, FoundationIconName } from './FoundationIcon';
import { formatDate, readLocale } from './formatting';
import { formatText, readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';

const icons: Record<ApprovalState, FoundationIconName> = {
    [ApprovalState.Pending]: 'circle', [ApprovalState.Current]: 'clock', [ApprovalState.Approved]: 'check', [ApprovalState.Rejected]: 'close', [ApprovalState.Skipped]: 'minus',
};
const tones: Record<ApprovalState, string> = {
    [ApprovalState.Pending]: 'neutral', [ApprovalState.Current]: 'info', [ApprovalState.Approved]: 'success', [ApprovalState.Rejected]: 'danger', [ApprovalState.Skipped]: 'neutral',
};

/**
 * The `approvalChainStepper` component: the steps a request goes through, who decides each, and where it stands.
 *
 * `steps` are written in order with a `label`, an `approver`, a `state` (pending, current, approved, rejected, skipped), and when it was
 * decided (`at`) and a `comment`. The chain applies its own rules - a rejection stops the chain and the steps after it read "Not reached", and
 * with no current step the first undecided one is it - so a request page needs no logic of its own. Every step says its state in words as
 * well as by icon and color, the current step carries `aria-current="step"`, and the whole is an ordered list with the overall outcome
 * stated above it. `orientation` is `horizontal` or `vertical`; below a phone's width it is always vertical.
 */
export function ApprovalChainStepper({ element, interactions }: RegisteredComponentProps) {
    const written = useMemo(() => readSteps(element.properties.steps), [element.properties.steps]);
    const steps = useMemo(() => effectiveSteps(written), [written]);
    const outcome = chainOutcome(written);
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const state = readComponentState(element, written.length > 0);
    const stateText: Record<ApprovalState, string> = {
        pending: strings.approvalPending, current: strings.approvalCurrent, approved: strings.approvalApproved, rejected: strings.approvalRejected, skipped: strings.approvalSkipped,
    };
    const outcomeText: Record<ChainOutcome, string> = {
        approved: strings.approvalOutcomeApproved, rejected: strings.approvalOutcomeRejected, inProgress: strings.approvalOutcomeInProgress, pending: strings.approvalOutcomePending,
    };

    return (
        <FoundationFrame element={element} interactions={interactions} name='approval-chain' state={state} skeleton={[100, 100]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && (
                <>
                    <p className='foundation-approval-outcome' data-outcome={outcome}>{outcomeText[outcome]}</p>
                    <ol className='foundation-approval-steps' aria-label={strings.approvalChain} data-orientation={element.properties.orientation === 'vertical' ? 'vertical' : 'horizontal'}>
                        {steps.map((step, index) => (
                            <li key={step.label + index} className='foundation-approval-step' data-state={step.state} aria-current={step.state === ApprovalState.Current ? 'step' : undefined}>
                                <span className='foundation-chip' data-tone={tones[step.state]}><FoundationIcon name={icons[step.state]} /><span>{step.notReached ? strings.approvalNotReached : stateText[step.state]}</span></span>
                                <strong className='foundation-approval-label'>
                                    <span className='foundation-visually-hidden'>{`${formatText(strings.approvalStep, { n: index + 1, total: steps.length })}: `}</span>
                                    {step.label}
                                </strong>
                                {step.approver && <span className='foundation-count'>{step.approver}</span>}
                                {step.at && <time className='foundation-count' dateTime={step.at}>{formatDate(step.at, locale, true)}</time>}
                                {step.comment && <span className='foundation-approval-comment'>{step.comment}</span>}
                            </li>
                        ))}
                    </ol>
                </>
            )}
        </FoundationFrame>
    );
}
