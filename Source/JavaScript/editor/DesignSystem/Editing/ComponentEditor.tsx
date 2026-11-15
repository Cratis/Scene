// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from '@cratis/components/Common';
import type { DesignSystem, DesignVariant } from '@cratis/scene.model';
import { ComponentSample } from '../Browsing/ComponentSample';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import { fill } from '../fill';
import { Panel } from '../Parts/Panel';
import { Segmented } from '../Parts/Segmented';
import { componentParts, componentStates, partsInState, resolvedVariantIn, tokensForPart } from '../Resolving/designResolution';

export interface ComponentEditorProps {
    /** The component's name. */
    component: string;

    /** The variant being edited. */
    variant: DesignVariant;

    /** The draft's design system. */
    design: DesignSystem;

    /** The theme the sample is drawn in. */
    theme: string;

    /** The mode the sample is drawn in. */
    mode: string;

    /** Whether a change is being saved. */
    saving: boolean;

    /** Sets a part to a token; answers why it could not. */
    onSetPart: (component: string, variant: string, state: string, part: string, token: string) => Promise<string | undefined>;

    /** Leaves the editor. */
    onClose: () => void;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

/**
 * Edits one variant of a component on the draft: for each part - text, background, border, radius and so on - a token is
 * picked. A raw value cannot be typed here; it must become a token first, on the foundations.
 */
export const ComponentEditor = ({ component, variant, design, theme, mode, saving, onSetPart, onClose, strings }: ComponentEditorProps) => {
    const words = strings.components;
    const [state, setState] = useState<string>('default');
    const [error, setError] = useState<string | undefined>();
    const parts = partsInState(variant, resolvedVariantIn(design, theme, mode, component, variant.name), state);
    const choose = async (part: string, token: string) => setError(await onSetPart(component, variant.name, state, part, token));

    return (
        <Panel title={fill(words.editingTitle, { component, variant: variant.name })} description={words.editingDescription}>
            <div className='studio-design-system__stack'>
                <div className='studio-design-system__bar'>
                    <Segmented label={words.state} value={state} onChange={setState} options={componentStates.map(candidate => ({ value: candidate, label: candidate }))} />
                    <ComponentSample parts={parts} label={component} />
                </div>
                <div className='studio-design-system__fields'>
                    {componentParts.map(part => {
                        const current = parts.find(candidate => candidate.part === part)?.token ?? '';
                        const options = tokensForPart(design, part);
                        const offered = options.includes(current) || current === '' ? options : [current, ...options];
                        const id = `studio-design-system-part-${part}`;
                        return (
                            <label key={part} className='studio-design-system__field' htmlFor={id}>
                                <span className='studio-design-system__field-label'>{part}</span>
                                <select
                                    id={id}
                                    className='studio-design-system__select'
                                    value={current}
                                    aria-label={fill(words.partLabel, { part, component, variant: variant.name })}
                                    disabled={saving}
                                    onChange={event => { if (event.target.value !== '' && event.target.value !== current) void choose(part, event.target.value); }}>
                                    {current === '' && <option value=''>{words.pickAToken}</option>}
                                    {offered.map(value => <option key={value} value={value}>{value}</option>)}
                                </select>
                            </label>
                        );
                    })}
                </div>
                {error !== undefined && <p role='alert' className='studio-design-system__error'>{error}</p>}
                <div><Button variant='ghost' label={words.done} onClick={onClose} /></div>
            </div>
        </Panel>
    );
};
