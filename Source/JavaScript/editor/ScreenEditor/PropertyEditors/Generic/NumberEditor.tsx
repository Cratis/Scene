// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { draftProblem } from './draftProblem';

// A number, with the descriptor's minimum, maximum and step and the unit it is measured in shown after it. Committed on blur or Enter, and
// only when the engine accepts it; emptying the field unsets the property.
export const NumberEditor = ({ value, onChange, descriptor, context, disabled, problem, id }: PropertyEditorProps<number>) => {
    const stored = typeof value === 'number' ? String(value) : '';
    const [draft, setDraft] = useState(stored);
    const [local, setLocal] = useState<ReturnType<typeof draftProblem>>();
    useEffect(() => { setDraft(stored); setLocal(undefined); }, [stored]);

    const { minimum, maximum, integer } = descriptor.constraints ?? {};
    const step = descriptor.editorOptions?.step ?? (integer ? 1 : undefined);
    const unit = descriptor.editorOptions?.unit;
    const shown = local ?? problem;

    const commit = () => {
        if (draft === stored) return;
        if (draft.trim() === '') { setLocal(undefined); onChange(undefined); return; }
        const parsed = Number(draft);
        const found = Number.isFinite(parsed) ? draftProblem(descriptor, parsed) : { code: 'invalidValue', message: context.strings.editors.number.invalid };
        setLocal(found);
        if (!found) onChange(parsed);
    };

    return (
        <span className='studio-editor-number'>
            <input
                id={id} type='number' inputMode='decimal' className='studio-editor-field__input' value={draft} disabled={disabled}
                {...(minimum !== undefined ? { min: minimum } : {})} {...(maximum !== undefined ? { max: maximum } : {})} {...(step !== undefined ? { step } : {})}
                aria-invalid={shown ? true : undefined} aria-describedby={shown ? `${id}-problem` : undefined}
                onChange={event => setDraft(event.target.value)} onBlur={commit}
                onKeyDown={event => { if (event.key === 'Enter') commit(); if (event.key === 'Escape') { setDraft(stored); setLocal(undefined); } }} />
            {unit && <span className='studio-editor-number__unit'>{unit}</span>}
        </span>
    );
};
