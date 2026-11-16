// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { ScreenSet } from '@cratis/scene.design';
import type { DesignStringKey } from '../Host/DesignCanvasHost';
import { storylineNames } from '../State/storylines';

export interface StorylineBarProps {
    set: ScreenSet;
    storyline: string;
    /** The screen in focus, which a storyline can take in or let go. */
    screen?: string;
    /** Whether the host keeps storylines besides the default one. */
    editable: boolean;
    strings: Record<DesignStringKey, string>;
    onChoose(storyline: string): void;
    onAdd(name: string): void;
    onToggleStep(storyline: string, screen: string): void;
}

/**
 * The storyline the artboards are laid out along. The default storyline is every screen in order and cannot be edited - it follows the screens - while
 * the author's own storylines list the screens of a path, such as the alternative way through a flow.
 */
export const StorylineBar = ({ set, storyline, screen, editable, strings, onChoose, onAdd, onToggleStep }: StorylineBarProps) => {
    const [name, setName] = useState('');
    const authored = storyline !== set.defaultStoryline;
    const member = screen !== undefined && (set.storylines.find(candidate => candidate.name === storyline)?.steps.includes(screen) ?? false);

    return (
        <div className='design-storylines' role='group' aria-label={strings.storylines}>
            <label>
                <span className='design-storylines__label'>{strings.storylines}</span>
                <select value={storyline} aria-label={strings.storylines} onChange={event => onChoose(event.target.value)}>
                    {storylineNames(set).map(candidate => <option key={candidate} value={candidate}>{candidate === set.defaultStoryline ? strings.defaultStoryline : candidate}</option>)}
                </select>
            </label>
            {authored && screen !== undefined && (
                <label className='design-storylines__member'>
                    <input type='checkbox' checked={member} onChange={() => onToggleStep(storyline, screen)} />
                    <span>{screen}</span>
                </label>
            )}
            {editable && (
                <form className='design-storylines__add' onSubmit={event => { event.preventDefault(); if (name.trim() !== '') { onAdd(name); setName(''); } }}>
                    <input value={name} placeholder='New storyline' aria-label='New storyline' onChange={event => setName(event.target.value)} />
                    <button type='submit' disabled={name.trim() === ''}>+</button>
                </form>
            )}
        </div>
    );
};
