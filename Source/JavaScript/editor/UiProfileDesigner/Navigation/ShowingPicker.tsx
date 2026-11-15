// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DestinationGroupListing } from '@cratis/scene.blueprint.default';
import type { DestinationReference } from '@cratis/scene.model';
import { destinationLabel, sameDestination } from './destinationLabel';
import './CanvasNavigation.css';

export interface ShowingPickerProps {
    listing: DestinationGroupListing[];

    // What the canvas shows now.
    current?: DestinationReference;
    label: string;
    groupLabels: Record<string, string>;
    onPick(destination: DestinationReference): void;
}

// The *Showing* picker (spec N3): every page, state and dialog the application can show, grouped. Choosing one drives the same history a
// click on a navigation item does.
export const ShowingPicker = ({ listing, current, label, groupLabels, onPick }: ShowingPickerProps) => {
    const all = listing.flatMap(group => group.destinations);
    const selected = all.find(candidate => sameDestination(candidate.destination, current));

    return (
        <label className='studio-uiprofile-showing'>
            <span className='studio-uiprofile-showing__label'>{label}</span>
            <select
                className='studio-uiprofile-showing__select'
                aria-label={label}
                value={selected?.id ?? ''}
                onChange={event => {
                    const picked = all.find(candidate => candidate.id === event.target.value);
                    if (picked) onPick(picked.destination);
                }}>
                {selected === undefined && <option value='' disabled>{destinationLabel(current, all)}</option>}
                {listing.map(group => (
                    <optgroup key={group.group} label={groupLabels[group.group] ?? group.group}>
                        {group.destinations.map(destination => <option key={destination.id} value={destination.id}>{destination.label}</option>)}
                    </optgroup>
                ))}
            </select>
        </label>
    );
};
