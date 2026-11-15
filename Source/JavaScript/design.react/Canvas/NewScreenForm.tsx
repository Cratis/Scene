// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState, type FormEvent } from 'react';
import type { DesignMode } from '@cratis/scene.design';
import type { DesignStringKey } from '../Host/DesignCanvasHost';
import type { TemplateChoice } from '../State/templateSet';
import './NewScreenForm.css';

export interface NewScreenFormProps {
    mode: DesignMode;
    /** The templates a screen may be built on: only those the session's template set allows. */
    templates: readonly TemplateChoice[];
    strings: Record<DesignStringKey, string>;
    /** Resolves with the reason when the design refused, and with nothing when it was added. */
    onAdd(name: string, template: string | undefined): Promise<string | undefined>;
    onClose(): void;
}

/** The form that adds a screen built on one of the allowed templates - or, in template mode, a new template with a first slot. */
export const NewScreenForm = ({ mode, templates, strings, onAdd, onClose }: NewScreenFormProps) => {
    const [name, setName] = useState('');
    const [template, setTemplate] = useState(templates[0]?.name ?? '');
    const [problem, setProblem] = useState<string | undefined>();
    const [adding, setAdding] = useState(false);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (name.trim() === '' || adding) return;
        setAdding(true);
        try {
            const reason = await onAdd(name.trim(), mode === 'screens' ? template : undefined);
            if (reason === undefined) onClose();
            else setProblem(reason);
        } finally {
            setAdding(false);
        }
    };

    return (
        <form className='design-new-screen' aria-label={strings.newScreen} onSubmit={event => { void submit(event); }}>
            <label>
                <span>Name</span>
                <input value={name} autoFocus aria-label='Name' onChange={event => { setName(event.target.value); setProblem(undefined); }} />
            </label>
            {mode === 'screens' && (
                <label>
                    <span>{strings.templates}</span>
                    <select value={template} aria-label={strings.templates} onChange={event => setTemplate(event.target.value)}>
                        {templates.map(choice => <option key={choice.name} value={choice.name}>{choice.label}</option>)}
                    </select>
                </label>
            )}
            {problem !== undefined && <p role='alert' className='design-new-screen__problem'>{problem}</p>}
            <span className='design-new-screen__actions'>
                <button type='submit' disabled={name.trim() === '' || adding || (mode === 'screens' && template === '')}>{strings.newScreen}</button>
                <button type='button' onClick={onClose}>{strings.cancel}</button>
            </span>
        </form>
    );
};
