// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy, useId, useState, useSyncExternalStore } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary, BindingKind, BoundConstructor, MissingBinding, resolveExactQuery, subscribeQueryBindings } from '../bindings';
import { stringProperty } from '../properties';
import { SingleResultStatus } from '../data/SingleResultStatus';
import { QueryInput, queryInputError, queryInputs } from './queryInputs';

const SingleResultRuntime = lazy(() => import('../data/SingleResultRuntime'));

/** Opt-in, form-local string drafts around the existing optional-single execution owner. */
export function SceneQueryInputForm({ element }: RegisteredComponentProps) {
    const name = stringProperty(element.properties, 'query');
    const target = useSyncExternalStore(subscribeQueryBindings, () => name ? resolveExactQuery(name) : undefined);
    if (target === 'ambiguous') return <div role='alert'>Ambiguous query binding '{name}' on {element.componentName}</div>;
    if (!target) return <MissingBinding element={element} kind={BindingKind.Query} name={name} />;

    const inputs = queryInputs(element.properties);
    const resultField = stringProperty(element.properties, 'resultField');
    if (!inputs || !resultField) return <div role='alert'>Invalid query input form configuration</div>;
    if (!element.isEnabled) return <SingleResultStatus state='idle' />;

    // A different form declaration starts a new session; ordinary host rerenders retain drafts.
    return <QueryInputForm key={JSON.stringify([name, inputs, resultField])}
        query={target} inputs={inputs} resultField={resultField}
        label={stringProperty(element.properties, 'label') ?? 'Query input'}
        submitLabel={stringProperty(element.properties, 'submitLabel') ?? 'Search'} />;
}

interface Props {
    query: BoundConstructor;
    inputs: QueryInput[];
    resultField: string;
    label: string;
    submitLabel: string;
}

function QueryInputForm({ query, inputs, resultField, label, submitLabel }: Props) {
    const id = useId();
    const [drafts, setDrafts] = useState<Record<string, string>>(() => Object.fromEntries(inputs.map(input => [input.parameter, ''])));
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});
    const [committed, setCommitted] = useState<Record<string, string>>();

    return <form aria-label={label} noValidate onSubmit={event => {
        event.preventDefault();
        const validation = Object.fromEntries(inputs.map(input => [input.parameter, queryInputError(input, drafts[input.parameter])]));
        setErrors(validation);
        if (Object.values(validation).some(Boolean)) {
            setCommitted(undefined);
            return;
        }
        // New identity even for unchanged values: repeat submit is an explicit retry. No trimming,
        // coercion, generated identifier, property-path evaluation or query while typing.
        setCommitted(Object.freeze(Object.fromEntries(inputs.map(input => [input.parameter, drafts[input.parameter]]))));
    }}>
        {inputs.map((input, index) => {
            const controlId = `${id}-${index}`;
            const error = Object.hasOwn(errors, input.parameter) ? errors[input.parameter] : undefined;
            return <div key={input.parameter}>
                <label htmlFor={controlId}>{input.label}</label>
                <input id={controlId} name={input.parameter} type='text' required={input.required}
                    value={drafts[input.parameter]} aria-invalid={!!error} aria-describedby={error ? `${controlId}-error` : undefined}
                    onChange={event => {
                        setDrafts({ ...drafts, [input.parameter]: event.currentTarget.value });
                        setErrors({ ...errors, [input.parameter]: undefined });
                        // Unmount synchronously on edit: runtime cleanup aborts and masks late replies.
                        setCommitted(undefined);
                    }} />
                {error && <div id={`${controlId}-error`} role='alert'>{error}</div>}
            </div>;
        })}
        <button type='submit'>{submitLabel}</button>
        {committed ? <ArcRuntimeBoundary>
            <SingleResultRuntime query={query} queryArguments={committed} resultField={resultField} stringInputs />
        </ArcRuntimeBoundary> : <SingleResultStatus state='idle' />}
    </form>;
}
