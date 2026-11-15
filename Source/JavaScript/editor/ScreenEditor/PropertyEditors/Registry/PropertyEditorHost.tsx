// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@cratis/components/Common';
import type { InspectedProperty, SceneDiagnostic } from '@cratis/scene.model';
import { validateValue } from '@cratis/scene.engine';
import { isBindingExpression, isBindingProperty } from '../../Binding/bindingExpressionModel';
import { isStructured, withIdentities } from '../Structured/structuredValue';
import { structuredProblem } from '../Structured/structuredProblem';
import { withIconReferences } from '../Structured/withIconReferences';
import type { EditorContext, EditorProblem } from './PropertyEditorProps';
import type { PropertyEditorRegistry } from './PropertyEditorRegistry';
import './PropertyEditors.css';

export interface PropertyEditorHostProps {
    // `popover`: the editor alone, open in place - the label and the description are the popover's own heading and chip (DM5); `field` (default) is the Properties tab.
    presentation?: 'field' | 'popover';
    registry: PropertyEditorRegistry;
    property: InspectedProperty;
    context: EditorContext;

    // The element the property belongs to; it keys the editor, so selecting another element starts its editors afresh.
    componentId: string;

    // Applies a value through the editing session (undo, redo, dirty state and saving see it like any other edit); undefined unsets.
    onChange: (property: InspectedProperty, value: unknown) => void;

    // What Scene has said about the selection and the last edit; the findings for this property show under it (PE2).
    diagnostics: readonly SceneDiagnostic[];
}

type EditorState = { id: string; failed: boolean } | undefined;

// The editor for an id once it has loaded (PE5). Until then nothing is drawn in its place but a loading line; the editors already on screen are
// never touched, because nothing here suspends.
function useLoadedEditor(registry: PropertyEditorRegistry, id: string | undefined): { editor: ReturnType<PropertyEditorRegistry['loadedOf']>; failed: boolean } {
    const [state, setState] = useState<EditorState>();
    const editor = id ? registry.loadedOf(id) : undefined;

    useEffect(() => {
        if (!id || registry.loadedOf(id)) return;
        let current = true;
        registry.load(id).then(
            () => { if (current) setState({ id, failed: false }); },
            () => { if (current) setState({ id, failed: true }); });
        return () => { current = false; };
    }, [registry, id, editor]);

    return { editor, failed: id !== undefined && editor === undefined && state?.id === id && state.failed };
}

// Draws one inspected property with the editor the registry resolves for it, wherever the property is edited (the sidebar, a design-mode
// popover - PE3): its label, the editor, what Scene says is wrong with the value (PE2) and, when it may not be changed, the editor disabled with
// the reason (PE4). A property nothing describes is reported; the registry has no editor that shows JSON text.
export const PropertyEditorHost = ({ registry, property, context, componentId, onChange, diagnostics, presentation = 'field' }: PropertyEditorHostProps) => {
    const popover = presentation === 'popover';
    const { descriptor } = property;
    const id = `pe-${componentId}-${descriptor.path}`.replace(/[^A-Za-z0-9_-]/g, '-');
    const resolution = registry.resolve(descriptor);
    const bindable = isBindingProperty(property);
    const { editor: Editor, failed } = useLoadedEditor(registry, resolution?.id);
    const { editor: Binding } = useLoadedEditor(registry, bindable ? 'bindingExpression' : undefined);
    const text = context.strings.editors;

    const disabled = !property.editable || descriptor.readOnly === true;
    const reason = !property.editable ? property.reason ?? text.inherited : descriptor.readOnly === true ? text.readOnly : undefined;
    const stored = property.effectiveValue;
    const problem = problemOf(property, diagnostics);

    // A value saved before the descriptor described it - a table's rows without the identifiers a collection's items have - is not edited blind:
    // it is reported, and put right when that only means adding what was never there.
    const fits = (value: unknown) => validateValue(descriptor, withIconReferences(descriptor, value));
    const mismatch = stored === undefined || stored === null || !isStructured(descriptor) ? undefined : fits(stored) ?? structuredProblem(descriptor, stored);
    const converted = mismatch !== undefined && fits(stored) !== undefined ? withIdentities(descriptor, stored) : undefined;
    const canConvert = converted !== undefined && fits(converted) === undefined;

    const change = (value: unknown) => onChange(property, value);
    // A property a binding supplies is edited by the binding editor alone: its value is the binding, not something the plain editor can show.
    const bound = bindable && isBindingExpression(stored);
    const inlineLabel = descriptor.valueType === 'boolean';
    // An object, a collection of records or a list of plain values draws its own legend, so a label above it would say the same thing twice.
    const ownLegend = isStructured(descriptor);

    return (
        <div className={`studio-editor-field${inlineLabel ? ' studio-editor-field--inline' : ''}`} data-property={descriptor.path} data-editor={resolution?.id}>
            {ownLegend || popover ? <span id={`${id}-label`} hidden>{descriptor.label}</span> : <label id={`${id}-label`} htmlFor={id} className='studio-editor-field__label'>{descriptor.label}</label>}
            <div className='studio-editor-field__control'>
                {mismatch !== undefined ? (
                    <div className='studio-editor-structured__mismatch' role='alert'>
                        <p>{context.strings.structured.mismatch(descriptor.label, mismatch)}</p>
                        <button type='button' disabled={disabled || !canConvert} onClick={() => change(converted)}>{context.strings.structured.convert}</button>
                        <button type='button' disabled={disabled} onClick={() => change(undefined)}>{context.strings.structured.clear}</button>
                    </div>
                ) : bound ? null : Editor ? (
                    <ErrorBoundary key={componentId} fallback={<p className='studio-editor-binding__missing' role='alert'>{text.cannotLoad(descriptor.label)}</p>}>
                        <Editor id={id} value={stored} onChange={change} descriptor={descriptor} context={context} disabled={disabled} {...(popover ? { inline: true } : {})} {...(reason ? { readOnlyReason: reason } : {})} {...(problem ? { problem } : {})} />
                    </ErrorBoundary>
                ) : failed ? (
                    <p className='studio-editor-binding__missing' role='alert'>{text.cannotLoad(descriptor.label)}</p>
                ) : resolution ? (
                    <span className='studio-editor-field__loading' role='status'>{text.loading}</span>
                ) : (
                    <p className='studio-editor-structured__undescribed' role='alert'>{text.undescribed(descriptor.label)}</p>
                )}
                {Binding && <Binding id={`${id}-binding`} value={property.currentValue} onChange={change} descriptor={descriptor} context={context} disabled={disabled} />}
            </div>
            {descriptor.description && !popover && <p className='studio-editor-properties__hint'>{descriptor.description}</p>}
            {reason && <p className='studio-editor-field__reason' data-reason>{reason}</p>}
            {problem && <p id={`${id}-problem`} className='studio-editor-field__problem' role='alert' data-code={problem.code}>{problem.message}</p>}
        </div>
    );
};

// The engine's finding for this property, if it has one: the code a host switches on and the message a person reads.
export function problemOf(property: InspectedProperty, diagnostics: readonly SceneDiagnostic[]): EditorProblem | undefined {
    const found = diagnostics.find(diagnostic => diagnostic.path === property.descriptor.path && diagnostic.severity === 'error');
    return found ? { code: found.code, message: found.message } : undefined;
}
