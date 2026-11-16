// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystem } from '@cratis/scene.model';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import { fill } from '../fill';
import { NewToken } from '../Editing/NewToken';
import { TokenValueInput } from '../Editing/TokenValueInput';
import { EmptyNote, Panel } from '../Parts/Panel';
import { wordsOf } from './wordsOf';

export interface WordsProps {
    /** The design system of the version shown. */
    design: DesignSystem;

    /** Whether the version shown is the draft, so its words can be changed. */
    editable: boolean;

    /** Whether a change is being saved. */
    saving: boolean;

    /** Sets a word; answers why it could not be set. */
    onSetWord: (kind: 'voice' | 'naming', key: string, text: string) => Promise<string | undefined>;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

/**
 * The design system's words: the voice the application speaks in and the names it gives its own things, each held in the
 * design system's `words` and, on a draft, changed in place.
 */
export const Words = ({ design, editable, saving, onSetWord, strings }: WordsProps) => (
    <div className='studio-design-system__stack'>
        {wordsOf(design, strings.words).map(group => (
            <Panel key={group.kind} title={group.title} description={group.description}>
                {group.words.length === 0 && (
                    <EmptyNote
                        title={fill(strings.words.emptyTitle, { title: group.title.toLowerCase() })}
                        description={editable ? strings.words.emptyEditable : strings.words.emptyReadOnly} />
                )}
                <ul className='studio-design-system__rows'>
                    {group.words.map(word => (
                        <li key={word.key} className='studio-design-system__row'>
                            <span className='studio-design-system__row-main studio-design-system__name'>{word.key}</span>
                            {editable
                                ? <TokenValueInput value={word.text} label={fill(strings.words.textOf, { kind: group.kind, key: word.key })} disabled={saving} onCommit={text => onSetWord(group.kind, word.key, text)} />
                                : <span className='studio-design-system__word'>{word.text}</span>}
                        </li>
                    ))}
                </ul>
                {editable && (
                    <div className='studio-design-system__entry'>
                        <NewToken prefix={`${group.kind}.`} valueLabel={strings.words.text} strings={strings.tokenEntry} onAdd={(name, text) => onSetWord(group.kind, name, text)} disabled={saving} />
                    </div>
                )}
            </Panel>
        ))}
    </div>
);
