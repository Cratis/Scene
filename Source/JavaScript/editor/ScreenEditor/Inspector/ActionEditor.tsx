// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { CommandInputSource } from '../Actions/commandInputSources';
import { Opens } from '@cratis/scene.model';
import type { ActionModel } from '../Actions/ActionModel';
import { ActionProblemKind, diagnoseAction, suggestInputs, type ActionProblem } from '../Actions/diagnoseAction';
import { sliceNamedBy, type StateChangeSlice } from '../Actions/StateChangeSlice';
import { HookEnabledField } from '../Placement/HookEnabledField';
import { HookOpensField } from '../Placement/HookOpensField';
import { opensChangeOf } from '../Placement/hookBinding';
import type { PlacementEnvironment } from '../Placement/hookPlacement';
import { defaultPlacementStrings } from '../Placement/PlacementStrings';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import './QueryBindingEditor.css';

export interface ActionEditorProps {
    action?: ActionModel;
    slices: readonly StateChangeSlice[];
    sources: readonly CommandInputSource[];
    strings: ScreenEditorStrings;
    disabled: boolean;

    // What where it opens and when it is enabled are worked out against (StudioIssues#1331). Without it the choice is the plain list.
    placement?: PlacementEnvironment;

    // The value a command input is usually fed by, such as `row.id` for an input named after the row's identity.
    suggestSource: (inputName: string) => string | undefined;
    onChange: (action: ActionModel | undefined) => void;
}

const problemText = (problem: ActionProblem, text: ScreenEditorStrings['properties']['action']['problems']): string => {
    const input = problem.input ?? '';
    switch (problem.kind) {
        case ActionProblemKind.MissingSlice: return text.missingSlice;
        case ActionProblemKind.UnmappedInput: return text.unmappedInput(input);
        case ActionProblemKind.UnknownInput: return text.unknownInput(input);
        case ActionProblemKind.UnknownSource: return text.unknownSource(input);
    }
};

// Connects a button or a row action to a State Change slice: which one, what feeds each of its inputs, and how the form is presented.
export const ActionEditor = ({ action, slices, sources, strings, disabled, placement, suggestSource, onChange }: ActionEditorProps) => {
    const text = strings.properties.action;
    const slice = action ? sliceNamedBy(slices, action.sliceId) : undefined;
    const problems = action ? diagnoseAction(action, slices, new Set(sources.map(source => source.path))) : [];

    return (
        <fieldset className='studio-editor-query' disabled={disabled}>
            <legend>{text.label}</legend>
            <label>
                <span>{text.slice}</span>
                <select
                    value={slice?.id ?? action?.sliceId ?? ''}
                    onChange={event => {
                        const chosen = slices.find(candidate => candidate.id === event.target.value);
                        onChange(chosen ? { sliceId: chosen.id, sliceName: chosen.name, inputs: suggestInputs(chosen, suggestSource), opens: action?.opens ?? Opens.Automatic, ...(action?.opensIn ? { opensIn: action.opensIn } : {}) } : undefined);
                    }}
                >
                    <option value=''>{text.none}</option>
                    {action && !slice && <option value={action.sliceId}>{action.sliceName}</option>}
                    {slices.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}{candidate.origin.length > 0 ? ` - ${candidate.origin.join(' / ')}` : ''}</option>)}
                </select>
            </label>

            {action && slice && (
                <>
                    <div className='studio-editor-query__group'>
                        <strong>{text.inputs}</strong>
                        {slice.inputs.map(input => (
                            <label key={input.name}>
                                <span>{text.sourceFor(input.name)}{input.required ? ' *' : ''}</span>
                                <select value={action.inputs[input.name] ?? ''} onChange={event => onChange({ ...action, inputs: { ...action.inputs, [input.name]: event.target.value } })}>
                                    <option value=''>{strings.properties.query.noSource}</option>
                                    {sources.map(source => <option key={source.path} value={source.path}>{source.label}</option>)}
                                </select>
                            </label>
                        ))}
                    </div>
                    {placement ? (
                        <>
                            <div className='studio-editor-query__group'>
                                <strong>{(strings.properties.editors?.placement ?? defaultPlacementStrings).opens}</strong>
                                <HookOpensField
                                    hook={{ slice: action.sliceId, opens: action.opens, ...(action.opensIn ? { opensIn: action.opensIn } : {}), mapping: action.inputs, ...(action.subject ? { subject: action.subject } : {}) }}
                                    environment={placement}
                                    strings={strings.properties.editors?.placement ?? defaultPlacementStrings}
                                    disabled={disabled}
                                    onChange={value => {
                                        const { opens, opensIn } = opensChangeOf(value) ?? {};
                                        const { opensIn: _, ...rest } = action;
                                        onChange({ ...rest, opens: opens ?? Opens.Automatic, ...(opensIn ? { opensIn } : {}) });
                                    }} />
                            </div>
                            <div className='studio-editor-query__group'>
                                <strong>{(strings.properties.editors?.placement ?? defaultPlacementStrings).enabled}</strong>
                                <HookEnabledField
                                    hook={{ slice: action.sliceId, opens: action.opens, mapping: action.inputs }}
                                    environment={placement}
                                    strings={strings.properties.editors?.placement ?? defaultPlacementStrings}
                                    disabled={disabled}
                                    value={{ ...(action.subject ? { subject: action.subject } : {}), ...(action.enabledWhen ? { enabledWhen: action.enabledWhen } : {}) }}
                                    onChange={changed => {
                                        const { subject: _s, enabledWhen: _e, ...rest } = action;
                                        onChange({ ...rest, ...(changed.subject ? { subject: changed.subject } : {}), ...(changed.enabledWhen?.trim() ? { enabledWhen: changed.enabledWhen.trim() } : {}) });
                                    }} />
                            </div>
                        </>
                    ) : (
                        <>
                            <label>
                                <span>{text.opens}</span>
                                <select value={action.opens} onChange={event => onChange({ ...action, opens: event.target.value as Opens })}>
                                    <option value={Opens.Automatic}>{text.openings.automatic}</option>
                                    <option value={Opens.None}>{text.openings.none}</option>
                                    <option value={Opens.Dialog}>{text.openings.dialog}</option>
                                    <option value={Opens.Drawer}>{text.openings.drawer}</option>
                                    <option value={Opens.Slot}>{text.openings.slot}</option>
                                </select>
                            </label>
                            {action.opens === Opens.Slot && (
                                <label>
                                    <span>{text.opensIn}</span>
                                    <input value={action.opensIn ?? ''} onChange={event => onChange({ ...action, opensIn: event.target.value || undefined })} />
                                </label>
                            )}
                        </>
                    )}
                </>
            )}

            {problems.length > 0 && (
                <ul className='studio-editor-diagnostics' role='alert' aria-label={strings.properties.diagnostics}>
                    {problems.map((problem, index) => <li key={index} data-severity='error'>{problemText(problem, text.problems)}</li>)}
                </ul>
            )}
        </fieldset>
    );
};
