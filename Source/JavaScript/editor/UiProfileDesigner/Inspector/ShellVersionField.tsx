// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { describeVersionRule } from '@cratis/scene.engine';
import { pinsFor, type ShellPinKind } from '../Shell/shellPin';
import { Field } from './Field';

type VersionRule = NonNullable<ReturnType<typeof describeVersionRule>>;

export interface ShellVersionFieldProps {
    rule: VersionRule;
    installedVersion: Parameters<typeof pinsFor>[0];
    storedVersion: string | undefined;
    label: string;
    hint: string;
    onPin: (pin: ReturnType<typeof pinsFor>[ShellPinKind]) => void;
}

const pinKindOf = (value: string) => (value === 'follow' ? 'follow' : value === 'pin' ? 'exact' : 'latest') as ShellPinKind;

export const ShellVersionField = ({ rule, installedVersion, storedVersion, label, hint, onPin }: ShellVersionFieldProps) => (
    <Field label={label} htmlFor='studio-shell-version' hint={hint}>
        <select id='studio-shell-version' value={rule.selected ?? ''} onChange={event => onPin(pinsFor(installedVersion)[pinKindOf(event.target.value)])}>
            {rule.selected === undefined && <option value=''>{storedVersion}</option>}
            {rule.choices.map(choice => <option key={choice.kind} value={choice.kind}>{choice.label}</option>)}
        </select>
        <p className='studio-inspector-chip' data-tone={rule.status.tone} role='status'>{rule.status.text}</p>
    </Field>
);
