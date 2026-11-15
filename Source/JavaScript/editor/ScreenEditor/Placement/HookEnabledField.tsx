// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
import { OutletSubject } from '@cratis/scene.model';
import { EnablementOutcome, parseGuardCondition } from '@cratis/scene.engine';
import { inspectHook, type HookPlacementInput, type PlacementEnvironment } from './hookPlacement';
import type { EnabledValue } from './hookBinding';
import type { PlacementStrings } from './PlacementStrings';
import './Placement.css';

export interface HookEnabledFieldProps {
    hook: HookPlacementInput;
    environment: PlacementEnvironment | undefined;
    strings: PlacementStrings;
    disabled?: boolean;

    // What the outlet acts on, which a hook that says nothing takes as its own.
    outletSubject?: OutletSubject;
    value: EnabledValue;
    onChange: (value: EnabledValue) => void;
}

// When a hook is enabled (StudioIssues#1331, 6h). It is derived - what the hook acts on, what the command's authorization says, and an optional condition - and
// each check is listed with Scene's own reason, so the author sees why a button would be disabled before running it. Studio decides none of it.
export const HookEnabledField = ({ hook, environment, strings, disabled, outletSubject, value, onChange }: HookEnabledFieldProps) => {
    const subject = value.subject ?? '';
    const stored = value.enabledWhen ?? '';
    // Typed over, and saved when it is left or confirmed: one edit of the outlet per condition, not one per key.
    const [condition, setCondition] = useState(stored);
    const readable = condition.trim() === '' || parseGuardCondition(condition) !== undefined;
    useEffect(() => setCondition(stored), [stored]);
    const commit = () => { if (readable && condition.trim() !== stored.trim()) onChange({ ...value, enabledWhen: condition }); };
    const effective: HookPlacementInput = { ...hook, subject: value.subject ?? outletSubject ?? OutletSubject.Screen, ...(readable && condition.trim() !== '' ? { enabledWhen: condition } : {}) };
    const steps = inspectHook(effective, environment ?? { slices: [], slots: [], itemFields: new Set(), routeParameters: [] }).enablement.steps;

    return (
        <div className='studio-placement' data-field='enabled'>
            <label className='studio-placement__field'>
                <span>{strings.actsOn}</span>
                <select value={subject} disabled={disabled} onChange={event => onChange({ ...value, ...(event.target.value === '' ? { subject: undefined } : { subject: event.target.value as OutletSubject }) })}>
                    {(['', OutletSubject.Item, OutletSubject.Screen] as const).map(choice => <option key={choice} value={choice}>{strings.actsOnChoices[choice]}</option>)}
                </select>
            </label>
            <label className='studio-placement__field'>
                <span>{strings.condition}</span>
                <input
                    value={condition} disabled={disabled} placeholder={strings.conditionPlaceholder} aria-invalid={!readable || undefined}
                    onChange={event => setCondition(event.target.value)} onBlur={commit}
                    onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); commit(); } }} />
            </label>
            <p className='studio-placement__note'>{readable ? strings.conditionHint : strings.conditionUnreadable}</p>
            <p className='studio-placement__heading'>{strings.derivedFrom}</p>
            <ul className='studio-placement__steps' aria-label={strings.derivedFrom}>
                {steps.length === 0 && <li data-outcome='passed'>{strings.alwaysEnabled}</li>}
                {steps.map(step => <li key={step.check} data-outcome={step.outcome} data-blocked={step.outcome === EnablementOutcome.Blocked || undefined}><strong>{strings.steps[step.check]}</strong> {step.reason}</li>)}
            </ul>
        </div>
    );
};
