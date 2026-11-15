// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

export interface StarterBarProps {
    strings: UiProfileDesignerStrings;

    /** Takes the author to the Shell section, where a blueprint is chosen from the cards. */
    onChooseBlueprint: () => void;

    /** Takes the author to the Shell section, at the field for their own shell. */
    onChooseOwnShell: () => void;

    /** Dismisses the bar, keeping the defaults. */
    onKeep: () => void;
}

/**
 * What a new application sees above the preview: one line and three ways to begin. It decides nothing itself - each action lands in the section where the
 * choice is made, and the profile is stored by the first edit like any other.
 */
export const StarterBar = ({ strings, onChooseBlueprint, onChooseOwnShell, onKeep }: StarterBarProps) => {
    const text = strings.editor.starter;
    return (
        <section className='studio-starter' aria-label={strings.firstRun.heading}>
            <p>{text.text}</p>
            <div className='studio-starter__actions'>
                <button type='button' onClick={onChooseBlueprint}>{text.blueprint}</button>
                <button type='button' onClick={onChooseOwnShell}>{text.ownShell}</button>
                <button type='button' onClick={onKeep}>{text.keep}</button>
            </div>
        </section>
    );
};
