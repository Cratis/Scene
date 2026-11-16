// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignStringKey } from '../Host/DesignCanvasHost';
import { toggleTemplate, type TemplateChoice } from '../State/templateSet';
import './Panels.css';

export interface TemplateSetPickerProps {
    choices: readonly TemplateChoice[];
    strings: Record<DesignStringKey, string>;
    /** Called with the new set of allowed templates; undefined lifts the limit. */
    onChange(templateSet: string[] | undefined): void;
}

/**
 * The templates this design may use, chosen from those of the active design system. The palette, the new-screen dialog and the AI's catalogue all
 * list only what is allowed here, and the checks refuse the rest - so a story built on three templates cannot drift onto a fourth.
 */
export const TemplateSetPicker = ({ choices, strings, onChange }: TemplateSetPickerProps) => {
    const everyone = choices.every(choice => choice.allowed);
    return (
        <fieldset className='design-template-set'>
            <legend>{strings.templateSet}</legend>
            <label className='design-template-set__all'>
                <input type='checkbox' checked={everyone} onChange={() => onChange(undefined)} />
                <span>{strings.allTemplates}</span>
            </label>
            <ul>
                {choices.map(choice => (
                    <li key={choice.name}>
                        <label title={choice.description}>
                            <input type='checkbox' checked={choice.allowed} aria-label={choice.label} onChange={() => onChange(toggleTemplate(choices, choice.name))} />
                            <span>{choice.label}</span>
                            {choice.type !== undefined && <span className='design-template-set__type'>{choice.type}</span>}
                        </label>
                    </li>
                ))}
            </ul>
        </fieldset>
    );
};
