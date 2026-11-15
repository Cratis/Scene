// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { draftProblem } from './draftProblem';

// Text: one line, or a box when the descriptor says `multiline`. What is typed is a draft; it is committed when the field loses focus or,
// on a single line, on Enter - so each keystroke is not an undo step - and only when the engine accepts it. Escape puts the stored text
// back. Emptying the field unsets the property.
export const TextEditor = ({ value, onChange, descriptor, context, disabled, problem, id }: PropertyEditorProps<string>) => {
    const stored = typeof value === 'string' ? value : '';
    const [draft, setDraft] = useState(stored);
    const [local, setLocal] = useState<ReturnType<typeof draftProblem>>();
    useEffect(() => { setDraft(stored); setLocal(undefined); }, [stored]);

    const multiline = descriptor.editorOptions?.multiline === true;
    const placeholder = descriptor.editorOptions?.placeholder ?? context.strings.editors.text.placeholder;
    const shown = local ?? problem;

    const commit = () => {
        if (draft === stored) return;
        const next = draft === '' ? undefined : draft;
        const found = draftProblem(descriptor, next);
        setLocal(found);
        if (!found) onChange(next);
    };

    const common = {
        id, value: draft, disabled, placeholder, className: 'studio-editor-field__input', 'aria-invalid': shown ? true : undefined, 'aria-describedby': shown ? `${id}-problem` : undefined,
        onChange: (event: { target: { value: string } }) => setDraft(event.target.value),
        onBlur: commit,
    };

    return multiline
        ? <textarea rows={4} {...common} onKeyDown={event => { if (event.key === 'Escape') { setDraft(stored); setLocal(undefined); } }} />
        : <input type='text' {...common} onKeyDown={event => {
            if (event.key === 'Enter') commit();
            if (event.key === 'Escape') { setDraft(stored); setLocal(undefined); }
        }} />;
};
