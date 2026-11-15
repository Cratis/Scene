// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { Behavior } from '@cratis/scene.model';
import type { ConfigurationDestination } from '@cratis/components/ConfigurationEditor';
import type { StateChangeSlice } from '../Actions/StateChangeSlice';
import { ToolbarButtonClickKind } from '../Actions/ToolbarButtonClickKind';
import { readToolbarButtonClick, withToolbarButtonClick } from '../Actions/toolbarButtonClick';
import type { DestinationTargets } from '../Destinations/destinationProblems';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface ToolbarButtonClickEditorProps {
    behaviors: Behavior[] | undefined;
    targets: DestinationTargets;
    destinations: readonly ConfigurationDestination[];
    slices: readonly StateChangeSlice[];
    strings: ScreenEditorStrings['properties']['toolbarButton'];
    disabled: boolean;
    onChange: (behaviors: Behavior[] | undefined) => void;
}

interface TargetChoice {
    value: string;
    label: string;
}

// What a toolbar button does when pressed: lead to a screen, open a dialog template, or submit a slice's command. It is
// stored as a Scene click behavior on the button, beside any behaviors it already has.
export const ToolbarButtonClickEditor = ({ behaviors, targets, destinations, slices, strings, disabled, onChange }: ToolbarButtonClickEditorProps) => {
    const stored = readToolbarButtonClick(behaviors);

    // A kind chosen before its target is held here until the target is chosen: Scene has no action without one, so
    // nothing is written to the document - and nothing lands in the history - for a half-made choice.
    const [pendingKind, setPendingKind] = useState<ToolbarButtonClickKind>(ToolbarButtonClickKind.None);
    const click = stored.kind === ToolbarButtonClickKind.None ? { kind: pendingKind, target: '' } : stored;
    const choices = choicesFor(click.kind, targets, destinations, slices);
    const missing = click.target !== '' && !choices.some(choice => choice.value === click.target);

    const chooseKind = (kind: ToolbarButtonClickKind) => {
        setPendingKind(kind);
        if (stored.kind !== ToolbarButtonClickKind.None) onChange(withToolbarButtonClick(behaviors, { kind: ToolbarButtonClickKind.None, target: '' }));
    };
    const chooseTarget = (target: string) => {
        if (target === '' && stored.kind === ToolbarButtonClickKind.None) return;
        if (target === '') setPendingKind(click.kind);
        onChange(withToolbarButtonClick(behaviors, { kind: click.kind, target }));
    };

    return (
        <fieldset className='studio-editor-query' disabled={disabled}>
            <legend>{strings.label}</legend>
            <label>
                <span>{strings.onClick}</span>
                <select value={click.kind} onChange={event => chooseKind(event.target.value as ToolbarButtonClickKind)}>
                    <option value={ToolbarButtonClickKind.None}>{strings.kinds.none}</option>
                    <option value={ToolbarButtonClickKind.Navigate}>{strings.kinds.navigate}</option>
                    <option value={ToolbarButtonClickKind.OpenDialog}>{strings.kinds.openDialog}</option>
                    <option value={ToolbarButtonClickKind.ExecuteCommand}>{strings.kinds.executeCommand}</option>
                </select>
            </label>
            {click.kind !== ToolbarButtonClickKind.None && (
                <label>
                    <span>{strings.target}</span>
                    <select value={click.target} onChange={event => chooseTarget(event.target.value)}>
                        <option value=''>{strings.chooseTarget}</option>
                        {missing && <option value={click.target}>{strings.missingTarget(click.target)}</option>}
                        {choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
                    </select>
                </label>
            )}
            {(missing || (click.kind !== ToolbarButtonClickKind.None && click.target === '')) && (
                <ul className='studio-editor-diagnostics' role='alert' aria-label={strings.label}>
                    <li data-severity='error'>{missing ? strings.missingTarget(click.target) : strings.chooseTarget}</li>
                </ul>
            )}
        </fieldset>
    );
};

function choicesFor(kind: ToolbarButtonClickKind, targets: DestinationTargets, destinations: readonly ConfigurationDestination[], slices: readonly StateChangeSlice[]): TargetChoice[] {
    switch (kind) {
        case ToolbarButtonClickKind.Navigate: return destinations.map(destination => ({ value: destination.id, label: destination.group ? `${destination.group} / ${destination.label}` : destination.label }));
        case ToolbarButtonClickKind.OpenDialog: return targets.dialogTemplates.map(template => ({ value: template, label: template }));
        case ToolbarButtonClickKind.ExecuteCommand: return slices.map(slice => ({ value: slice.id, label: slice.origin.length > 0 ? `${slice.name} - ${slice.origin.join(' / ')}` : slice.name }));
        case ToolbarButtonClickKind.None: return [];
    }
}
