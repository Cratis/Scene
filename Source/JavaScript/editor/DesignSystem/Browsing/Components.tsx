// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignSystem } from '@cratis/scene.model';
import type { DesignSystemEditorStrings } from '../DesignSystemEditorStrings';
import { fill } from '../fill';
import { ComponentEditor } from '../Editing/ComponentEditor';
import { EmptyNote, Panel } from '../Parts/Panel';
import { Segmented } from '../Parts/Segmented';
import { partsInState, resolvedVariantIn, statesOfComponent, variantOf } from '../Resolving/designResolution';
import { ComponentSample } from './ComponentSample';
import { contrastFindingsOf, contrastFor, passes, ratioLabel } from './contrast';
import { whereUsed } from './whereUsed';

export interface ComponentsProps {
    /** The design system of the version shown. */
    design: DesignSystem;

    /** The theme shown. */
    theme: string;

    /** The mode the component being edited is shown in. */
    mode: string;

    /** The Screenplay source of the version shown - where a component is used is read from it. */
    screenplay: string;

    /** The component chosen, when one is. */
    component?: string;

    /** The variant chosen, when one is. */
    variant?: string;

    /** Chooses a component and variant. */
    onChoose: (component: string | undefined, variant?: string) => void;

    /** Whether the version shown is the draft, so its components can be changed. */
    editable: boolean;

    /** Whether a change is being saved. */
    saving: boolean;

    /** Sets one part of a variant in a state to a token; answers why it could not. */
    onSetPart: (component: string, variant: string, state: string, part: string, token: string) => Promise<string | undefined>;

    /** The words to use. */
    strings: DesignSystemEditorStrings;
}

/**
 * The design system's components: each one's variants shown in every state and mode, and - on a draft - the
 * parts of a variant picked from the tokens.
 */
export const Components = ({ design, theme, mode, screenplay, component, variant, onChoose, editable, saving, onSetPart, strings }: ComponentsProps) => {
    const words = strings.components;
    const components = design.components;
    const chosen = components.find(candidate => candidate.name === component) ?? components[0];
    if (chosen === undefined) {
        return (
            <Panel title={words.title}>
                <EmptyNote title={words.emptyTitle} description={editable ? words.emptyEditable : words.emptyReadOnly} />
            </Panel>
        );
    }

    const used = whereUsed(screenplay, chosen.name);
    const editing = variant === undefined ? undefined : variantOf(chosen, variant);
    const states = statesOfComponent(chosen);
    const findings = contrastFindingsOf(design);

    return (
        <div className='studio-design-system__stack'>
            <Segmented
                label={words.componentLabel}
                value={chosen.name}
                onChange={name => onChoose(name)}
                options={components.map(candidate => ({ value: candidate.name, label: candidate.name, count: candidate.variants.length }))} />
            <Panel title={chosen.name} description={fill(words.description, { theme })}>
                {chosen.variants.length === 0 && <EmptyNote title={fill(words.noVariants, { component: chosen.name })} />}
                <div className='studio-design-system__scroll'>
                    <table className='studio-design-system__table'>
                        <thead>
                            <tr>
                                <th scope='col'>{words.variant}</th>
                                {states.map(state => <th key={state} scope='col'>{state}</th>)}
                                {editable && <th scope='col'><span className='studio-design-system__sr-only'>{words.edit}</span></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {chosen.variants.map(candidate => (
                                <tr key={candidate.name}>
                                    <th scope='row'><span className='studio-design-system__name'>{candidate.name}</span></th>
                                    {states.map(state => (
                                        <td key={state}>
                                            <span className='studio-design-system__samples'>
                                                {design.modes.map(shown => {
                                                    const entry = state === 'disabled' ? undefined : contrastFor(findings, theme, chosen.name, candidate.name, state, shown);
                                                    const resolved = resolvedVariantIn(design, theme, shown, chosen.name, candidate.name);
                                                    return (
                                                        <span key={shown} className='studio-design-system__sample-cell' data-mode={shown}>
                                                            <ComponentSample parts={partsInState(candidate, resolved, state)} label={chosen.name} />
                                                            <span className='studio-design-system__note'>
                                                                {shown}
                                                                {entry !== undefined && (
                                                                    <>
                                                                        {' - '}
                                                                        <span className={passes(entry) ? undefined : 'studio-design-system__error'}>
                                                                            {ratioLabel(entry)}{passes(entry) ? '' : ` ${words.tooLow}`}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </span>
                                                        </span>
                                                    );
                                                })}
                                            </span>
                                        </td>
                                    ))}
                                    {editable && (
                                        <td>
                                            <button
                                                type='button'
                                                className='studio-design-system__link'
                                                onClick={() => onChoose(chosen.name, candidate.name)}
                                                aria-label={fill(words.editLabel, { component: chosen.name, variant: candidate.name })}>
                                                {words.editByHand}
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>
            <Panel title={words.whereUsedTitle} description={fill(words.whereUsedDescription, { component: chosen.name })}>
                {used.length === 0
                    ? <p className='studio-design-system__note'>{fill(words.whereUsedNone, { component: chosen.name })}</p>
                    : (
                        <ul aria-label={fill(words.whereUsedLabel, { component: chosen.name })} className='studio-design-system__tags'>
                            {used.map(place => <li key={place}>{place}</li>)}
                        </ul>
                    )}
            </Panel>
            {editable && editing !== undefined && (
                <ComponentEditor
                    component={chosen.name}
                    variant={editing}
                    design={design}
                    theme={theme}
                    mode={mode}
                    saving={saving}
                    onSetPart={onSetPart}
                    onClose={() => onChoose(chosen.name)}
                    strings={strings} />
            )}
        </div>
    );
};
