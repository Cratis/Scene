// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DestinationKind, type DestinationReference } from '@cratis/scene.model';
import type { DestinationProblemKind } from '../Destinations/DestinationProblemKind';
import type { ConfigurationDestination } from '@cratis/components/ConfigurationEditor';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface DestinationReferenceFieldsProps {
    id: string;
    label: string;
    value: DestinationReference | undefined;
    destinations: readonly ConfigurationDestination[];
    slots: readonly string[];
    dialogTemplates: readonly string[];

    // What is wrong with the destination as it stands; nothing when it leads somewhere that exists.
    problems?: readonly DestinationProblemKind[];
    disabled: boolean;
    strings: ScreenEditorStrings['properties']['destination'];
    onChange: (destination: DestinationReference | undefined) => void;
}

export const DestinationReferenceFields = ({ id, label, value, destinations, slots, dialogTemplates, problems = [], disabled, strings, onChange }: DestinationReferenceFieldsProps) => {
    const destination = value ?? {};
    const update = (change: Partial<DestinationReference>) => onChange(cleanDestination({ ...destination, ...change }));
    const clear = () => onChange(undefined);
    const slotList = `${id}-slots`;
    const dialogList = `${id}-dialogs`;

    return (
        <fieldset className='studio-editor-destination' disabled={disabled}>
            <legend>{label || strings.label}</legend>
            <label>
                <span>{strings.screen}</span>
                <select value={destination.screen ?? ''} onChange={event => update({ screen: event.target.value || undefined })}>
                    <option value=''>{strings.noScreen}</option>
                    {missingScreen(destination.screen, destinations) && <option value={destination.screen}>{strings.missingScreen(destination.screen)}</option>}
                    {destinations.map(candidate => <option key={candidate.id} value={candidate.id}>{destinationLabel(candidate)}</option>)}
                </select>
            </label>
            <label>
                <span>{strings.route}</span>
                <input value={destination.route ?? ''} placeholder={strings.routePlaceholder} onChange={event => update({ route: event.target.value || undefined })} />
            </label>
            <label>
                <span>{strings.kind}</span>
                <select value={destination.kind ?? ''} onChange={event => update({ kind: (event.target.value || undefined) as DestinationKind | undefined })}>
                    <option value=''>{strings.kinds.default}</option>
                    <option value={DestinationKind.Slot}>{strings.kinds.slot}</option>
                    <option value={DestinationKind.Dialog}>{strings.kinds.dialog}</option>
                    <option value={DestinationKind.External}>{strings.kinds.external}</option>
                </select>
            </label>
            <label>
                <span>{strings.slot}</span>
                <input list={slotList} value={destination.slot ?? ''} onChange={event => update({ slot: event.target.value || undefined })} />
                <datalist id={slotList}>{slots.map(slot => <option key={slot} value={slot} />)}</datalist>
            </label>
            <label>
                <span>{strings.dialog}</span>
                <input list={dialogList} value={destination.dialog ?? ''} onChange={event => update({ dialog: event.target.value || undefined })} />
                <datalist id={dialogList}>{dialogTemplates.map(template => <option key={template} value={template} />)}</datalist>
            </label>
            <button type='button' onClick={clear}>{strings.clear}</button>
            {problems.length > 0 && (
                <ul className='studio-editor-diagnostics' role='alert' aria-label={label || strings.label}>
                    {problems.map(problem => <li key={problem} data-severity='error'>{strings.problems[problem]}</li>)}
                </ul>
            )}
        </fieldset>
    );
};

function destinationLabel(destination: ConfigurationDestination): string {
    return destination.group ? `${destination.group} / ${destination.label}` : destination.label;
}

function missingScreen(screen: string | undefined, destinations: readonly ConfigurationDestination[]): screen is string {
    return !!screen && !destinations.some(destination => destination.id === screen);
}

function cleanDestination(destination: DestinationReference): DestinationReference | undefined {
    const cleaned: DestinationReference = {
        ...destination,
        ...(destination.screen ? { screen: destination.screen } : {}),
        ...(destination.route ? { route: destination.route } : {}),
        ...(destination.slot ? { slot: destination.slot } : {}),
        ...(destination.dialog ? { dialog: destination.dialog } : {}),
    };
    for (const property of ['screen', 'route', 'slot', 'dialog', 'kind'] as const) {
        if (!cleaned[property]) delete cleaned[property];
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}
