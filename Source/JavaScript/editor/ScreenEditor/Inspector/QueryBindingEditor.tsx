// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { InspectedProperty, QueryBinding, QueryCandidate } from '@cratis/scene.model';
import type { BindingTypeScope } from '@cratis/scene.engine';
import { bindToCandidate, isColumnShown, isQueryBinding, mapColumn, mapParameter, sourceOf, unmapColumn } from '../Binding/queryBindingModel';
import { PreviewState, previewState } from '../Binding/previewState';
import { settleBinding } from '../Binding/settleBinding';
import { DiagnosticList } from './DiagnosticList';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import './QueryBindingEditor.css';

export interface QueryBindingEditorProps {
    property: InspectedProperty;
    candidates: readonly QueryCandidate[];
    scope: BindingTypeScope;
    strings: ScreenEditorStrings;
    disabled: boolean;
    onChange: (binding: QueryBinding | undefined) => void;
}

const originPath = (candidate: QueryCandidate): string => candidate.origin.map(origin => origin.name).join(' / ');

// Binds a data component to a query the screen's scope offers: which query, where each parameter's value comes from,
// and which result fields become columns. Scene checks every change against the query and says what is wrong inline.
export const QueryBindingEditor = ({ property, candidates, scope, strings, disabled, onChange }: QueryBindingEditorProps) => {
    const text = strings.properties.query;
    // A binding is built in steps, and Scene stores only one that holds together, so the unfinished one is kept here.
    const [draft, setDraft] = useState<QueryBinding>();
    const stored = isQueryBinding(property.effectiveValue) ? property.effectiveValue : undefined;
    const binding = draft ?? stored;
    const candidate = binding ? candidates.find(known => known.id === binding.queryId) : undefined;
    const diagnostics = binding ? settleBinding(property.descriptor, candidate, binding, scope).diagnostics : [];

    const change = (next: QueryBinding | undefined) => {
        if (!next) {
            setDraft(undefined);
            onChange(undefined);
            return;
        }

        const settled = settleBinding(property.descriptor, candidates.find(known => known.id === next.queryId), next, scope);
        setDraft(settled.isStorable ? undefined : next);
        if (settled.isStorable) onChange(next);
    };
    const state = previewState({ binding, candidate, isLoading: false });
    const sources = Object.keys(scope.types);

    return (
        <fieldset className='studio-editor-query' disabled={disabled}>
            <legend>{property.descriptor.label}</legend>
            <label>
                <span>{text.label}</span>
                <select
                    value={binding?.queryId ?? ''}
                    onChange={event => {
                        const chosen = candidates.find(known => known.id === event.target.value);
                        change(chosen ? bindToCandidate(chosen) : undefined);
                    }}
                >
                    <option value=''>{text.none}</option>
                    {binding && !candidate && <option value={binding.queryId}>{binding.query}</option>}
                    {candidates.map(known => <option key={known.id} value={known.id}>{known.name} - {originPath(known)}</option>)}
                </select>
            </label>

            {binding && !candidate && <p className='studio-editor-query__missing' role='alert'>{text.missing}</p>}

            {binding && candidate && (
                <>
                    {candidate.parameters.length > 0 && (
                        <div className='studio-editor-query__group'>
                            <strong>{text.parameters}</strong>
                            {candidate.parameters.map(parameter => (
                                <label key={parameter.name}>
                                    <span>{text.sourceFor(parameter.name)}{parameter.required ? ' *' : ''}</span>
                                    <select value={sourceOf(binding, parameter)} onChange={event => change(mapParameter(binding, parameter.name, event.target.value))}>
                                        <option value=''>{text.noSource}</option>
                                        {sources.map(source => <option key={source} value={source}>{source}</option>)}
                                    </select>
                                </label>
                            ))}
                        </div>
                    )}
                    <div className='studio-editor-query__group'>
                        <strong>{text.columns}</strong>
                        {candidate.resultFields.map(field => (
                            <label key={field.name} className='studio-editor-query__column'>
                                <input
                                    type='checkbox'
                                    checked={isColumnShown(binding, field)}
                                    onChange={event => change(event.target.checked ? mapColumn(binding, field.name) : unmapColumn(binding, field.name))}
                                />
                                <span>{text.showColumn(field.name)}</span>
                            </label>
                        ))}
                    </div>
                </>
            )}

            <p className='studio-editor-query__preview' role='status' data-state={state}>{previewMessage(state, text.preview)}</p>
            <DiagnosticList diagnostics={diagnostics} label={strings.properties.diagnostics} />
        </fieldset>
    );
};

function previewMessage(state: PreviewState, text: ScreenEditorStrings['properties']['query']['preview']): string {
    switch (state) {
        case PreviewState.NoQuery: return text.noQuery;
        case PreviewState.MissingQuery: return text.missingQuery;
        case PreviewState.Loading: return text.loading;
        case PreviewState.Empty: return text.empty;
        case PreviewState.Error: return text.error;
        case PreviewState.Ready: return text.ready;
    }
}
