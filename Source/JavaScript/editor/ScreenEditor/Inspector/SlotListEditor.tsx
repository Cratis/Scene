// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SlotRole, type Slot } from '@cratis/scene.model';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface SlotListEditorProps {
    slots: readonly Slot[];

    // The slot a screen fills: it is always there, so it can be described but not renamed or removed.
    primarySlot: string;
    hint: string;
    disabled: boolean;
    strings: ScreenEditorStrings['properties']['slots'];
    onChange: (slots: Slot[]) => void;
}

// The regions of a template a screen and its navigation fill: each slot's name, what kind of region it is, whether it is part of the address,
// and whether the template still makes sense when nothing fills it (Scene 5, StudioIssues#1328).
export const SlotListEditor = ({ slots, primarySlot, hint, disabled, strings, onChange }: SlotListEditorProps) => {
    const update = (index: number, slot: Slot) => onChange(slots.map((candidate, candidateIndex) => candidateIndex === index ? cleanSlot(slot) : candidate));
    const remove = (index: number) => onChange(slots.filter((_, candidateIndex) => candidateIndex !== index));
    const move = (fromIndex: number, toIndex: number) => onChange(moveSlot(slots, fromIndex, toIndex));
    const add = () => onChange([...slots, { name: nextSlotName(slots, strings.newSlotName) }]);

    return (
        <section className='studio-editor-slots' aria-label={strings.label}>
            <strong>{strings.label}</strong>
            <small>{hint}</small>
            {slots.map((slot, index) => {
                const isPrimary = slot.name === primarySlot;
                return (
                    <fieldset key={index} className='studio-editor-slots__item' disabled={disabled}>
                        <legend>{slot.name || strings.unnamed}</legend>
                        <label>
                            <span>{strings.name}</span>
                            <input value={slot.name} disabled={isPrimary} onChange={event => update(index, { ...slot, name: event.target.value })} />
                        </label>
                        <label>
                            <span>{strings.role}</span>
                            <select value={slot.role ?? ''} onChange={event => update(index, { ...slot, role: roleOf(event.target.value) })}>
                                <option value=''>{strings.roles.none}</option>
                                <option value={SlotRole.Page}>{strings.roles.page}</option>
                                <option value={SlotRole.Pane}>{strings.roles.pane}</option>
                                <option value={SlotRole.Panel}>{strings.roles.panel}</option>
                            </select>
                        </label>
                        <label title={strings.routedHint}>
                            <input type='checkbox' checked={slot.routed === true} onChange={event => update(index, { ...slot, routed: event.target.checked })} />
                            <span>{strings.routed}</span>
                        </label>
                        <label title={strings.optionalHint}>
                            <input type='checkbox' checked={slot.optional === true} disabled={isPrimary} onChange={event => update(index, { ...slot, optional: event.target.checked })} />
                            <span>{strings.optional}</span>
                        </label>
                        <div className='studio-editor-slots__actions'>
                            <button type='button' disabled={index === 0} onClick={() => move(index, index - 1)}>{strings.moveUp}</button>
                            <button type='button' disabled={index === slots.length - 1} onClick={() => move(index, index + 1)}>{strings.moveDown}</button>
                            <button type='button' disabled={isPrimary} onClick={() => remove(index)}>{strings.remove}</button>
                        </div>
                    </fieldset>
                );
            })}
            <button type='button' disabled={disabled} onClick={add}>{strings.add}</button>
        </section>
    );
};

function roleOf(value: string): SlotRole | undefined {
    return Object.values(SlotRole).find(role => role === value);
}

// A slot keeps only what was said about it, so a cleared choice leaves nothing behind and an untouched slot stays as it was stored.
export function cleanSlot(slot: Slot): Slot {
    const { role, routed, optional, ...rest } = slot;
    return {
        ...rest,
        ...(role ? { role } : {}),
        ...(routed ? { routed } : {}),
        ...(optional ? { optional } : {}),
    };
}

function moveSlot(slots: readonly Slot[], fromIndex: number, toIndex: number): Slot[] {
    const next = [...slots];
    const [slot] = next.splice(fromIndex, 1);
    if (slot) next.splice(toIndex, 0, slot);
    return next;
}

export function nextSlotName(slots: readonly Slot[], baseName: string): string {
    const names = new Set(slots.map(slot => slot.name));
    if (!names.has(baseName)) return baseName;
    for (let index = 2; ; index++) {
        const name = `${baseName}${index}`;
        if (!names.has(name)) return name;
    }
}
