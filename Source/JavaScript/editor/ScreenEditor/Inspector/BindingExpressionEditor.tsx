// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef, useState } from 'react';
import { BindingSourceKind, PropertyValueType, type BindingExpression, type InspectedProperty, type PropertyDescriptor } from '@cratis/scene.model';
import { StructuredValueEditor } from '../PropertyEditors/Structured/StructuredValueEditor';
import type { StructuredEditorStrings } from '../PropertyEditors/Structured/StructuredEditorStrings';
import { defaultStructuredEditorStrings } from '../PropertyEditors/Structured/defaultStructuredEditorStrings';
import { isStructured } from '../PropertyEditors/Structured/structuredValue';
import type { BindingSourceInventory } from '../Binding/bindingSources';
import { defaultAcceptedBindingKinds, bindingNullBehaviors, defaultBinding, expectedValueTypes, isBindingExpression } from '../Binding/bindingExpressionModel';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import {
    LiteralEditorKind, bindingShapedValue, defaultLiteralValue, forKind, kindOf, literalKindFor, literalSignature, modesFor, normalize, sourceKindChoices,
} from './bindingExpressionEdits';
import './BindingExpressionEditor.css';

export interface BindingExpressionEditorProps {
    property: InspectedProperty;
    sources: BindingSourceInventory;
    strings: ScreenEditorStrings;
    disabled: boolean;
    onChange: (binding: BindingExpression | undefined) => void;
}

export const BindingExpressionEditor = ({ property, sources, strings, disabled, onChange }: BindingExpressionEditorProps) => {
    const text = strings.properties.binding;
    const stored = isBindingExpression(property.effectiveValue) ? property.effectiveValue : undefined;
    const unsupported = stored ? undefined : bindingShapedValue(property.effectiveValue);
    const replacement = defaultBinding(property);
    const binding = stored ?? replacement;
    const accepted = property.descriptor.acceptedBindingKinds?.length ? property.descriptor.acceptedBindingKinds : defaultAcceptedBindingKinds;
    const kinds = sourceKindChoices(binding, accepted, sources, text);
    const query = binding.query ? sources.queryResults.find(candidate => candidate.id === binding.query || candidate.name === binding.query) : undefined;
    const component = binding.componentId ? sources.componentOutputs.find(output => output.componentId === binding.componentId) : undefined;

    const update = (patch: Partial<BindingExpression>) => onChange(normalize({ ...binding, ...patch }));
    const reset = () => onChange(undefined);

    if (unsupported !== undefined) {
        return (
            <fieldset className='studio-editor-binding' disabled={disabled}>
                <legend>{property.descriptor.label}</legend>
                <div className='studio-editor-binding__missing' role='alert'>
                    <p>{text.unsupportedValue}</p>
                    <pre>{JSON.stringify(unsupported, undefined, 2) ?? ''}</pre>
                </div>
                <div className='studio-editor-binding__row'>
                    <button type='button' onClick={() => onChange(replacement)}>{text.replaceUnsupported}</button>
                    <button type='button' onClick={reset}>{text.clear}</button>
                </div>
            </fieldset>
        );
    }

    return (
        <fieldset className='studio-editor-binding' disabled={disabled}>
            <legend>{property.descriptor.label}</legend>
            <div className='studio-editor-binding__row'>
                <label>
                    <span>{text.source}</span>
                    <select value={binding.kind ?? BindingSourceKind.DataContext} onChange={event => update(forKind(event.target.value as BindingSourceKind, binding))}>
                        {kinds.map(choice => <option key={choice.kind} value={choice.kind} disabled={choice.disabled}>{choice.label}</option>)}
                    </select>
                </label>
                <OptionalChoice label={text.mode} emptyLabel={text.inheritedMode} value={binding.mode} options={modesFor(binding)} onChange={mode => update({ mode })} />
                <OptionalChoice label={text.nullBehavior} emptyLabel={text.defaultNullBehavior} value={binding.nullBehavior} options={bindingNullBehaviors} onChange={nullBehavior => update({ nullBehavior })} />
                <OptionalChoice label={text.expectedType} emptyLabel={text.inferType} value={binding.expectedValueType} options={expectedValueTypes} onChange={expectedValueType => update({ expectedValueType })} />
            </div>
            {kinds.filter(choice => choice.disabled && choice.reason).map(choice => <p key={`${choice.kind}:reason`} className='studio-editor-binding__missing'>{choice.label}: {choice.reason}</p>)}

            {kindOf(binding) === BindingSourceKind.DataContext && (
                <PathField id={`${property.descriptor.path}-data-context-paths`} label={text.path} value={binding.path} options={sources.dataContextPaths} onChange={path => update({ path })} />
            )}

            {kindOf(binding) === BindingSourceKind.CommandResponse && (
                <CommandResponseFields id={`${property.descriptor.path}-command-response-paths`} path={binding.path} source={sources.commandResponse} text={text} onChange={path => update({ path })} />
            )}

            {kindOf(binding) === BindingSourceKind.QueryResult && (
                <>
                    <label>
                        <span>{text.query}</span>
                        <select value={binding.query ?? ''} onChange={event => update({ query: event.target.value, path: '' })}>
                            <option value=''>{text.noSource}</option>
                            {binding.query && !query && <option value={binding.query}>{text.missingQuery(binding.query)}</option>}
                            {sources.queryResults.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
                        </select>
                    </label>
                    <PathField id={`${property.descriptor.path}-query-paths`} label={text.path} value={binding.path} options={query?.fields ?? []} onChange={path => update({ path })} />
                    {binding.query && !query && <p className='studio-editor-binding__missing' role='alert'>{text.missingQuery(binding.query)}</p>}
                </>
            )}

            {kindOf(binding) === BindingSourceKind.ComponentProperty && (
                <>
                    <label>
                        <span>{text.component}</span>
                        <select value={binding.componentId ?? ''} onChange={event => update({ componentId: event.target.value, componentPropertyPath: '', path: '' })}>
                            <option value=''>{text.noSource}</option>
                            {binding.componentId && !component && <option value={binding.componentId}>{text.missingComponent(binding.componentId)}</option>}
                            {sources.componentOutputs.map(output => <option key={output.componentId} value={output.componentId}>{output.label} ({output.componentId})</option>)}
                        </select>
                    </label>
                    <PathField id={`${property.descriptor.path}-component-paths`} label={text.componentProperty} value={binding.componentPropertyPath ?? binding.path} options={component?.outputs.map(output => output.path) ?? []} onChange={path => update({ componentPropertyPath: path, path })} />
                    {binding.componentId && !component && <p className='studio-editor-binding__missing' role='alert'>{text.missingComponent(binding.componentId)}</p>}
                </>
            )}

            {kindOf(binding) === BindingSourceKind.Literal && (
                <LiteralValueField key={literalSignature(binding.value, binding.expectedValueType ?? property.descriptor.valueType)} value={binding.value} descriptor={property.descriptor} targetType={binding.expectedValueType ?? property.descriptor.valueType} strings={text} structured={strings.properties.structured ?? defaultStructuredEditorStrings} onChange={value => update({ value, path: '' })} />
            )}

            {stored && <button type='button' onClick={reset}>{text.clear}</button>}
        </fieldset>
    );
};

interface OptionalChoiceProps<T extends string> {
    label: string;
    emptyLabel: string;
    value: T | undefined;
    options: readonly T[];
    onChange: (value: T | undefined) => void;
}

// A choice among options that can also be left unset.
const OptionalChoice = <T extends string>({ label, emptyLabel, value, options, onChange }: OptionalChoiceProps<T>) => (
    <label>
        <span>{label}</span>
        <select value={value ?? ''} onChange={event => onChange(event.target.value === '' ? undefined : event.target.value as T)}>
            <option value=''>{emptyLabel}</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
    </label>
);

interface CommandResponseFieldsProps {
    id: string;
    path: string;
    source: BindingSourceInventory['commandResponse'];
    text: ScreenEditorStrings['properties']['binding'];
    onChange: (path: string) => void;
}

const CommandResponseFields = ({ id, path, source, text, onChange }: CommandResponseFieldsProps) => (
    <>
        <PathField id={id} label={text.path} value={path} options={source?.paths ?? []} onChange={onChange} />
        {!source && <p className='studio-editor-binding__missing' role='alert'>{text.commandResponseOutOfScope}</p>}
    </>
);

interface PathFieldProps {
    id: string;
    label: string;
    value: string;
    options: readonly string[];
    onChange: (path: string) => void;
}

const PathField = ({ id, label, value, options, onChange }: PathFieldProps) => (
    <label>
        <span>{label}</span>
        <input list={id} value={value} onChange={event => onChange(event.target.value)} />
        <datalist id={id}>{options.map(option => <option key={option} value={option} />)}</datalist>
    </label>
);

interface LiteralValueFieldProps {
    value: unknown;
    descriptor: PropertyDescriptor;
    targetType: PropertyValueType;
    strings: ScreenEditorStrings['properties']['binding'];
    structured: StructuredEditorStrings;
    onChange: (value: unknown) => void;
}

// The literal a binding holds. A plain value is a field of its kind; a structure - an object, a collection, a list - is edited through
// what the property's descriptor describes, and one that nothing describes cannot be authored as a literal, rather than being typed
// as JSON text.
const LiteralValueField = ({ value, descriptor, targetType, strings, structured, onChange }: LiteralValueFieldProps) => {
    const initialKind = literalKindFor(value, targetType);
    const initialSignature = literalSignature(value, targetType);
    const lastSyncedSignature = useRef(initialSignature);
    const [kind, setKind] = useState(initialKind);

    useEffect(() => {
        const nextSignature = literalSignature(value, targetType);
        if (nextSignature === lastSyncedSignature.current) return;
        lastSyncedSignature.current = nextSignature;
        setKind(literalKindFor(value, targetType));
    }, [value, targetType]);

    const changeKind = (nextKind: LiteralEditorKind) => {
        setKind(nextKind);
        const nextValue = defaultLiteralValue(nextKind);
        lastSyncedSignature.current = literalSignature(nextValue, targetType);
        onChange(nextValue);
    };

    const describable = isStructured(descriptor);

    return (
        <div className='studio-editor-binding__literal'>
            <label>
                <span>{strings.literalType}</span>
                <select value={kind} onChange={event => changeKind(event.target.value as LiteralEditorKind)}>
                    <option value={LiteralEditorKind.String}>String</option>
                    <option value={LiteralEditorKind.Number}>Number</option>
                    <option value={LiteralEditorKind.Boolean}>Boolean</option>
                    <option value={LiteralEditorKind.Null}>Null</option>
                    {(describable || kind === LiteralEditorKind.Json) && <option value={LiteralEditorKind.Json}>{strings.literalStructured}</option>}
                </select>
            </label>
            {kind === LiteralEditorKind.String && <label><span>{strings.literalValue}</span><input value={typeof value === 'string' ? value : ''} onChange={event => onChange(event.target.value)} /></label>}
            {kind === LiteralEditorKind.Number && <label><span>{strings.literalValue}</span><input type='number' value={typeof value === 'number' ? String(value) : ''} onChange={event => onChange(event.target.value === '' ? undefined : Number(event.target.value))} /></label>}
            {kind === LiteralEditorKind.Boolean && <label><span>{strings.literalValue}</span><select value={value === true ? 'true' : 'false'} onChange={event => onChange(event.target.value === 'true')}><option value='true'>true</option><option value='false'>false</option></select></label>}
            {kind === LiteralEditorKind.Null && <p>{strings.literalNull}</p>}
            {kind === LiteralEditorKind.Json && describable && (
                <StructuredValueEditor descriptor={descriptor} value={value} idPrefix='literal' strings={structured} disabled={false} onChange={next => onChange(next ?? defaultLiteralValue(LiteralEditorKind.Json))} />
            )}
            {kind === LiteralEditorKind.Json && !describable && <p className='studio-editor-binding__missing' role='alert'>{strings.literalNoEditor}</p>}
        </div>
    );
};
