// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// Where on a small drawing of the page a slot sits, as fractions of its width and height. Named slots the usual shells use have a fixed place;
// any other slot is placed in turn along the bottom, so every slot has a distinct position on the diagram.
export function slotRegion(slot: string, slots: readonly string[]): { x: number; y: number; width: number; height: number } {
    switch (slot.toLowerCase()) {
        case 'header': case 'top': case 'topbar': return { x: 0, y: 0, width: 1, height: 0.2 };
        case 'footer': case 'bottom': return { x: 0, y: 0.8, width: 1, height: 0.2 };
        case 'side': case 'sidebar': case 'start': case 'left': return { x: 0, y: 0.2, width: 0.25, height: 0.6 };
        case 'aside': case 'end': case 'right': return { x: 0.75, y: 0.2, width: 0.25, height: 0.6 };
        case 'content': case 'main': case 'body': return { x: 0.25, y: 0.2, width: 0.5, height: 0.6 };
        default: {
            const others = slots.filter(candidate => !['header', 'top', 'topbar', 'footer', 'bottom', 'side', 'sidebar', 'start', 'left', 'aside', 'end', 'right', 'content', 'main', 'body'].includes(candidate.toLowerCase()));
            const position = others.indexOf(slot);
            return { x: 0.25 + 0.5 * (Math.max(position, 0) / Math.max(others.length, 1)), y: 0.2, width: 0.5 / Math.max(others.length, 1), height: 0.6 };
        }
    }
}

// The slot of the template in effect an item renders into (spec 8.2): the slots as chips, and a mini diagram of the page with the chosen
// slot's position marked.
export const RenderingSlotEditor = ({ value, onChange, context, disabled, id }: PropertyEditorProps<string>) => {
    const text = context.strings.editors.renderingSlot;
    const slots = context.lookups.slots;
    const stored = typeof value === 'string' && value !== '' ? value : undefined;
    const shown = stored !== undefined && !slots.includes(stored) ? [...slots, stored] : slots;
    if (shown.length === 0) return <p id={id} className='studio-editor-properties__hint'>{text.none}</p>;

    return (
        <div id={id} className='studio-editor-slot' role='radiogroup' aria-labelledby={`${id}-label`}>
            <div className='studio-editor-chips'>
                {shown.map(slot => (
                    <button
                        key={slot} type='button' role='radio' aria-checked={slot === stored} disabled={disabled}
                        className={`studio-editor-chip${slot === stored ? ' studio-editor-chip--chosen' : ''}`}
                        onClick={() => onChange(slot === stored ? undefined : slot)}>
                        {text.names[slot] ?? slot}
                    </button>
                ))}
            </div>
            <svg className='studio-editor-slot__diagram' viewBox='0 0 100 60' role='img' aria-label={stored ? text.diagram(stored) : ''}>
                <rect x='0.5' y='0.5' width='99' height='59' rx='3' className='studio-editor-slot__page' />
                {shown.map(slot => {
                    const region = slotRegion(slot, shown);
                    return <rect key={slot} data-slot={slot} data-chosen={slot === stored || undefined} x={region.x * 100 + 1} y={region.y * 60 + 1} width={region.width * 100 - 2} height={region.height * 60 - 2} rx='2' className={`studio-editor-slot__region${slot === stored ? ' studio-editor-slot__region--chosen' : ''}`} />;
                })}
            </svg>
        </div>
    );
};
