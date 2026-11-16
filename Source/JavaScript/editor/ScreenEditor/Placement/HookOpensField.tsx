// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens } from '@cratis/scene.model';
import type { PlacementEnvironment, HookPlacementInput } from './hookPlacement';
import { opensChoicesFor, routeText } from './opensOptions';
import { opensValueOf } from './hookBinding';
import type { PlacementStrings } from './PlacementStrings';
import './Placement.css';

export interface HookOpensFieldProps {
    hook: HookPlacementInput;
    environment: PlacementEnvironment | undefined;
    strings: PlacementStrings;
    disabled?: boolean;

    // The value is the way it opens - `automatic`, `none`, `dialog`, `drawer` - or `slot:<name>`.
    onChange: (value: string) => void;
}

const order: readonly Opens[] = [Opens.Automatic, Opens.None, Opens.Dialog, Opens.Drawer, Opens.Slot];

// Where a hook opens its slice (StudioIssues#1331, 6e): the choices every button and `action` component shares. Automatic says where it works out to and why; a choice
// that cannot be taken is greyed with the reason Scene gives; the slots of the page are listed with the URL a routed one makes of the opening.
export const HookOpensField = ({ hook, environment, strings, disabled, onChange }: HookOpensFieldProps) => {
    if (!environment) return null;
    if (!hook.slice) return <p className='studio-placement__note'>{strings.chooseSlice}</p>;

    const { inspection, decision, options, slots } = opensChoicesFor(hook, environment);
    if (!decision) return <p className='studio-placement__note'>{strings.chooseSlice}</p>;

    const current = opensValueOf(hook.opens, hook.opensIn);
    const isChosen = (value: Opens) => value === Opens.Slot ? current.startsWith('slot') : current === value;
    const choose = (value: string, available: boolean) => { if (!disabled && available) onChange(value); };

    return (
        <div className='studio-placement' data-field='opens'>
            {inspection.screenless && <p className='studio-placement__note' data-screenless=''>{strings.screenless}</p>}
            <div role='radiogroup' aria-label={strings.opens} className='studio-placement__choices'>
                {order.map(value => {
                    const option = options.find(candidate => candidate.value === value);
                    if (!option) return null;
                    const text = strings.choices[value as keyof PlacementStrings['choices']];
                    const unavailable = !option.available;
                    return (
                        <div key={value} className='studio-placement__choice' data-chosen={isChosen(value) || undefined} data-unavailable={unavailable || undefined}>
                            <button
                                type='button' role='radio' aria-checked={isChosen(value)} aria-disabled={unavailable || disabled || undefined}
                                data-opens={value} title={unavailable ? option.reason : text.hint}
                                onClick={() => choose(value === Opens.Slot ? opensValueOf(Opens.Slot, slots.find(slot => slot.offered)?.name) : value, option.available)}>
                                <strong>{text.label}</strong>
                                <span>{value === Opens.Slot && !unavailable ? text.hint : option.reason || text.hint}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
            {isChosen(Opens.Automatic) && <p className='studio-placement__resolved' data-resolved=''>{decision.reason}</p>}
            {!inspection.screenless && (
                <ul className='studio-placement__slots' aria-label={strings.slotsHeading}>
                    {slots.length === 0 && <li className='studio-placement__note'>{strings.noSlots}</li>}
                    {slots.map(slot => (
                        <li key={slot.name} data-unavailable={!slot.offered || undefined} data-chosen={current === `slot:${slot.name}` || undefined}>
                            <button
                                type='button' aria-pressed={current === `slot:${slot.name}`} aria-disabled={!slot.offered || disabled || undefined}
                                data-slot={slot.name} title={slot.reason}
                                onClick={() => choose(`slot:${slot.name}`, slot.offered)}>
                                <strong>{slot.name}</strong>
                                <span>{strings.slotKind(slot.role, slot.routed)}</span>
                                <em>{slot.offered ? slot.route ? strings.slotRoute(routeText(slot.route)) : slot.reason : slot.reason}</em>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
