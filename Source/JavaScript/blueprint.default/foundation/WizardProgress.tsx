// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';
import { StepStatus, canOpen, neighbour, readWizardSteps, reachableStep, statusOf } from './wizardModel';
import { ActionButton } from './ActionButton';
import { useUrlState } from './urlState';

const storageKey = (element: { id: string }, key: string | undefined) => `scene.wizard.${key ?? element.id}`;

/**
 * The completed steps saved in the session, or none. Storage can be absent or refuse access - server rendering, a sandboxed frame, a browser in a
 * private mode - and a wizard that cannot remember its progress is still a wizard, so every storage access is guarded and a failure only loses the memory.
 */
function readSaved(key: string): Set<string> {
    try {
        const saved = JSON.parse(window.sessionStorage.getItem(key) ?? '[]') as unknown;
        return new Set(Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []);
    } catch {
        return new Set();
    }
}

/** Saves the completed steps for the session; a refusal by the browser is ignored (see {@link readSaved}). */
function writeSaved(key: string, completed: Set<string>): void {
    try {
        window.sessionStorage.setItem(key, JSON.stringify([...completed]));
    } catch {
        // The progress is simply not remembered across a refresh.
    }
}

/**
 * The `wizardProgress` component: the steps of a linear wizard, the back/next/finish controls and the draft save, with the step's own content in
 * the slot named by its id.
 *
 * `steps` (`id`, `label`, `valid`) are linear. Next is blocked while the current step is not `valid`, and says so. The final step is the review step: Finish
 * replaces Next. Completed steps stay in a progress list and can be revisited; a step cannot be opened before the ones ahead of it are done. The current step
 * (in the address under `urlKey`) and the completed steps (in the session) are restored on refresh, and a refresh can never land past a step that was not
 * done. The id of the current step is the `value` output; "Save draft" runs the behaviors attached to the element and says so.
 */
export function WizardProgress({ element, interactions, slots, bindingOutputs }: RegisteredComponentProps) {
    const steps = useMemo(() => readWizardSteps(element.properties.steps), [element.properties.steps]);
    const urlKey = readOptionalString(element, 'urlKey');
    const [requested, setRequested] = useUrlState(urlKey, readOptionalString(element, 'currentStep'));
    const key = storageKey(element, urlKey);
    const [completed, setCompleted] = useState<Set<string>>(() => readSaved(key));
    const [draftSaved, setDraftSaved] = useState(false);
    const strings = readFoundationStrings(element);
    const state = readComponentState(element, steps.length > 0);
    const current = reachableStep(steps, completed, requested);
    const index = steps.findIndex(step => step.id === current);
    const step = steps[index];
    const last = index === steps.length - 1;

    useEffect(() => writeSaved(key, completed), [key, completed]);
    useValueOutput(bindingOutputs, current);

    const go = (id: string | undefined) => { if (id === undefined) return; setRequested(id); setDraftSaved(false); interactions?.onSelect?.(); };
    const next = () => {
        if (!step?.valid) return;
        setCompleted(current_ => new Set(current_).add(step.id));
        go(neighbour(steps, current, 1)?.id);
    };
    const finish = () => { if (!step?.valid) return; setCompleted(current_ => new Set(current_).add(step.id)); interactions?.onClick?.({ stopPropagation: () => undefined }); };

    return (
        <FoundationFrame element={element} interactions={interactions} name='wizard' state={state} skeleton={[100, 60, 100]}>
            {state !== ComponentState.Loading && step && (
                <>
                    <nav aria-label={strings.wizardProgress}>
                        <ol className='foundation-wizard-steps'>
                            {steps.map((candidate, position) => {
                                const status = statusOf(completed, current, candidate.id);
                                const open = canOpen(steps, completed, candidate.id);
                                const text = status === StepStatus.Completed ? strings.wizardComplete : status === StepStatus.Current ? strings.wizardCurrent : strings.wizardUpcoming;
                                return (
                                    <li key={candidate.id} className='foundation-wizard-step' data-status={status}>
                                        <button type='button' aria-current={status === StepStatus.Current ? 'step' : undefined} disabled={!open} onClick={() => go(candidate.id)}>
                                            <span className='foundation-wizard-marker'>{status === StepStatus.Completed ? <FoundationIcon name='check' /> : position + 1}</span>
                                            <span>{candidate.label}</span>
                                            <span className='foundation-visually-hidden'>{`, ${formatText(strings.wizardStep, { n: position + 1, total: steps.length })}, ${text}`}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>
                    <div className='foundation-wizard-body' role='group' aria-label={`${formatText(strings.wizardStep, { n: index + 1, total: steps.length })}: ${step.label}`}>
                        {slots?.[step.id]}
                    </div>
                    <div className='foundation-wizard-actions'>
                        <ActionButton emphasis='quiet' disabledReason={strings.disabledNoPermission} onClick={() => { setDraftSaved(true); interactions?.onClick?.({ stopPropagation: () => undefined }); }}>{strings.wizardSaveDraft}</ActionButton>
                        <span role='status' className='foundation-count'>{draftSaved ? strings.wizardDraftSaved : ''}</span>
                        <span className='foundation-wizard-spacer' />
                        {index > 0 && <ActionButton emphasis='secondary' disabledReason={strings.disabledNoPermission} onClick={() => go(neighbour(steps, current, -1)?.id)}>{strings.wizardBack}</ActionButton>}
                        <button type='button' className='foundation-button' aria-disabled={!step.valid || undefined} onClick={last ? finish : next}>{last ? strings.wizardFinish : strings.wizardNext}</button>
                    </div>
                </>
            )}
        </FoundationFrame>
    );
}
