// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button, TextInput } from '@cratis/components/Common';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';

export interface NewTokenProps {
    /** What the entry is added to - `color.`, `words.voice.` - shown before the name so a person only types the name. */
    prefix: string;

    /** What the second field is called - the value of a token, the text of a word. */
    valueLabel: string;

    /** Whether the entry also says what it is for - a token role does, a word does not. */
    withDescription?: boolean;

    /** The words to use. */
    strings: DesignSystemEditorStrings['tokenEntry'];

    /** Adds the entry; answers why it could not be added. */
    onAdd: (name: string, value: string, description: string) => Promise<string | undefined>;

    /** Stops adding while a save is in flight. */
    disabled?: boolean;
}

const blank = { name: '', description: '', value: '' };

/** Adds a token, or a word, to the draft: its name, what it is for when it is a token, and its value. */
export const NewToken = ({ prefix, valueLabel, withDescription = false, strings, onAdd, disabled }: NewTokenProps) => {
    const [entry, setEntry] = useState(blank);
    const [error, setError] = useState<string | undefined>();
    const { name, description, value } = entry;
    const ready = name.trim() !== '' && value.trim() !== '' && (!withDescription || description.trim() !== '');
    const set = (key: keyof typeof blank) => (text: string) => setEntry(current => ({ ...current, [key]: text }));

    const add = async () => {
        const problem = await onAdd(name.trim(), value.trim(), description.trim());
        setError(problem);
        if (problem === undefined) setEntry(blank);
    };

    return (
        <form className='studio-design-system__new-token' onSubmit={event => { event.preventDefault(); void add(); }}>
            <span className='studio-design-system__prefix'>{prefix}</span>
            <TextInput value={name} onChange={set('name')} aria-label={strings.name} placeholder={strings.namePlaceholder} invalid={error !== undefined} />
            {withDescription && <TextInput value={description} onChange={set('description')} aria-label={strings.whatItIsFor} placeholder={strings.whatItIsForPlaceholder} invalid={error !== undefined} />}
            <TextInput value={value} onChange={set('value')} aria-label={valueLabel} placeholder={strings.valuePlaceholder} invalid={error !== undefined} />
            <Button type='submit' variant='outline' icon='pi pi-plus' label={strings.add} disabled={disabled === true || !ready} />
            {error !== undefined && <span role='alert' className='studio-design-system__error'>{error}</span>}
        </form>
    );
};
