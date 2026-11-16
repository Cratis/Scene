// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { screenName } from '../Document/studioScreen';
import { commandFormElements } from '../Forms/commandFormElements';
import type { StateChangeSlice } from '../Actions/StateChangeSlice';
import type { ScreenEditorController } from '../Host/ScreenEditorController';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface FormAuthoringSectionProps {
    controller: ScreenEditorController;
    slices: readonly StateChangeSlice[];
    strings: ScreenEditorStrings;
    disabled: boolean;
}

// The screen's forms at a glance: which command each is for and whether a command form element presents it. A form is authored on the
// command form element that owns it - select the element - so there is nothing to add or edit here; a form no element presents is
// shown only so it can be removed.
export const FormAuthoringSection = ({ controller, slices, strings, disabled }: FormAuthoringSectionProps) => {
    const screen = controller.document.screens.find(candidate => candidate.name === screenName);
    const forms = screen?.forms ?? [];
    if (!screen) return null;
    const text = strings.properties.forms;
    const presented = new Set(commandFormElements(controller.composition.roots, slices).map(element => element.commandName));

    return (
        <section className='studio-editor-properties__forms'>
            <strong>{text.label}</strong>
            <p className='studio-editor-properties__hint'>{text.ownedByElements}</p>
            {forms.length > 0 && <ul>
                {forms.map((form, index) => {
                    const isPresented = presented.has(form.forCommand);
                    return (
                        <li key={`${form.name}:${index}`}>
                            <span>{form.name}</span>
                            <span>{isPresented ? text.presented : text.notPresented}</span>
                            {!isPresented && (
                                <button type='button' disabled={disabled} onClick={() => controller.setScreenForms(forms.filter((_, candidateIndex) => candidateIndex !== index), text.remove)}>{text.remove}</button>
                            )}
                        </li>
                    );
                })}
            </ul>}
        </section>
    );
};
