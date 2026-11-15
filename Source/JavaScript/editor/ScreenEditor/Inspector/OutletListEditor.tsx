// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FilterControl, OutletItemKind, OutletKind, OutletSubject, type Outlet, type OutletItem, type Slot } from '@cratis/scene.model';
import { outletItemKinds } from '@cratis/scene.engine';
import { addActionOf } from '../DesignMode/Outlets/outletDesignModes';
import type { OutletStrings } from '../DesignMode/Outlets/OutletStrings';

export interface OutletListEditorProps {
    outlets: readonly Outlet[];
    slots: readonly Slot[];
    disabled: boolean;
    strings: OutletStrings;
    newId: () => string;
    onChange: (outlets: Outlet[]) => void;
}

// The outlets a template offers (6b): each one's name and kind - actions, filters, tabs, stats or navigation - who an outlet of actions acts on, the slot an
// outlet of tabs owns, and its default items, with the "+" of its kind. Which items a kind takes is Scene's to say (`outletItemKinds`).
export const OutletListEditor = ({ outlets, slots, disabled, strings, newId, onChange }: OutletListEditorProps) => {
    const text = strings.template;
    const update = (index: number, outlet: Outlet) => onChange(outlets.map((candidate, candidateIndex) => candidateIndex === index ? cleanOutlet(outlet) : candidate));
    const remove = (index: number) => onChange(outlets.filter((_, candidateIndex) => candidateIndex !== index));
    const add = () => onChange([...outlets, { name: nextOutletName(outlets, text.newOutletName), kind: OutletKind.Actions, defaults: [] }]);
    const changeDefault = (index: number, itemId: string, change: Record<string, unknown>) => {
        const outlet = outlets[index];
        update(index, { ...outlet, defaults: outlet.defaults.map(item => item.id === itemId ? { ...item, ...change } as OutletItem : item) });
    };

    return (
        <section className='studio-editor-slots studio-editor-outlets' aria-label={text.outlets}>
            <strong>{text.outlets}</strong>
            {outlets.map((outlet, index) => {
                const adds = addActionOf[outlet.kind];
                return (
                    <fieldset key={index} className='studio-editor-slots__item' disabled={disabled} data-outlet={outlet.name} data-outlet-kind={outlet.kind}>
                        <legend>{strings.frameName(outlet.name, strings.kinds[outlet.kind] ?? outlet.kind)}</legend>
                        <label>
                            <span>{text.name}</span>
                            <input value={outlet.name} onChange={event => update(index, { ...outlet, name: event.target.value })} />
                        </label>
                        <label>
                            <span>{text.kind}</span>
                            <select value={outlet.kind} onChange={event => update(index, withKind(outlet, event.target.value as OutletKind))}>
                                {Object.values(OutletKind).map(kind => <option key={kind} value={kind}>{strings.kinds[kind] ?? kind}</option>)}
                            </select>
                        </label>
                        {outlet.kind === OutletKind.Actions && (
                            <label>
                                <span>{text.subject}</span>
                                <select value={outlet.subject ?? ''} onChange={event => update(index, { ...outlet, subject: (event.target.value || undefined) as OutletSubject | undefined })}>
                                    <option value=''>{text.subjects['']}</option>
                                    <option value={OutletSubject.Item}>{text.subjects.item}</option>
                                </select>
                            </label>
                        )}
                        {outlet.kind === OutletKind.Tabs && (
                            <label>
                                <span>{text.slot}</span>
                                <select value={outlet.slot ?? ''} onChange={event => update(index, { ...outlet, slot: event.target.value || undefined })}>
                                    <option value=''>{text.noSlot}</option>
                                    {slots.map(slot => <option key={slot.name} value={slot.name}>{slot.name}</option>)}
                                </select>
                            </label>
                        )}
                        <div className='studio-editor-outlets__defaults'>
                            <span>{text.defaults} · {text.defaultsCount(outlet.defaults.length)}</span>
                            <ul>
                                {outlet.defaults.map(item => (
                                    <li key={item.id} data-default={item.id}>
                                        <input aria-label={strings.bindings.title} value={titleOf(item)} onChange={event => changeDefault(index, item.id, { title: event.target.value })} />
                                        {item.kind === OutletItemKind.Tab && (
                                            <input aria-label={strings.bindings.shows} value={String((item as { shows?: unknown }).shows ?? '')} onChange={event => changeDefault(index, item.id, { shows: event.target.value })} />
                                        )}
                                        {item.kind === OutletItemKind.Filter && (
                                            <select aria-label={strings.bindings.control} value={String((item as { control?: unknown }).control ?? FilterControl.Search)} onChange={event => changeDefault(index, item.id, { control: event.target.value })}>
                                                {Object.values(FilterControl).map(control => <option key={control} value={control}>{strings.bindings.controls[control] ?? control}</option>)}
                                            </select>
                                        )}
                                        <button type='button' onClick={() => update(index, { ...outlet, defaults: outlet.defaults.filter(candidate => candidate.id !== item.id) })}>{text.removeDefault}</button>
                                    </li>
                                ))}
                            </ul>
                            <button type='button' data-add={adds.id} onClick={() => update(index, { ...outlet, defaults: [...outlet.defaults, newDefault(adds.item, newId(), strings)] })}>
                                {strings.add(strings.newItem[adds.item] ?? adds.item)}
                            </button>
                        </div>
                        <button type='button' onClick={() => remove(index)}>{text.removeOutlet}</button>
                    </fieldset>
                );
            })}
            <button type='button' onClick={add} disabled={disabled}>{text.addOutlet}</button>
        </section>
    );
};

const titleOf = (item: OutletItem): string => String((item as { title?: unknown }).title ?? '');

function newDefault(kind: OutletItemKind, id: string, strings: OutletStrings): OutletItem {
    const title = strings.newItem[kind] ?? kind;
    switch (kind) {
        case OutletItemKind.Tab: return { kind, id, title, shows: '' };
        case OutletItemKind.Filter: return { kind, id, title, control: FilterControl.Search };
        default: return { kind, id, title } as OutletItem;
    }
}

// A kind takes only its own items: changing it leaves out the defaults the new kind does not take, and what only another kind names.
function withKind(outlet: Outlet, kind: OutletKind): Outlet {
    const takes = outletItemKinds(kind);
    const { subject: _, slot: __, ...rest } = outlet;
    return { ...rest, kind, defaults: outlet.defaults.filter(item => takes.includes(item.kind)) };
}

function cleanOutlet(outlet: Outlet): Outlet {
    const cleaned = { ...outlet };
    if (cleaned.subject === undefined) delete cleaned.subject;
    if (!cleaned.slot) delete cleaned.slot;
    return cleaned;
}

function nextOutletName(outlets: readonly Outlet[], base: string): string {
    for (let index = 1; ; index++) {
        const name = index === 1 ? base : `${base}${index}`;
        if (!outlets.some(outlet => outlet.name === name)) return name;
    }
}
