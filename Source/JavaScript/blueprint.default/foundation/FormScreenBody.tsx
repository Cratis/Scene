// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { ActionButton } from './ActionButton';
import { ComponentState, readComponentState } from './ComponentState';
import { FormField, FormFieldType, FormMode, FormSection, FormValues, addressLines, mapServerErrors, readFormMode, readFormSections, sameValues, validate } from './formModel';
import { readLocale } from './formatting';
import { formatText, readFoundationStrings } from './foundationStrings';
import { readPermissionRule } from './PermissionRule';
import { FoundationIcon } from './FoundationIcon';
import { FoundationFrame } from './StateFrame';

interface FieldProps {
    field: FormField;
    value: unknown;
    error?: string;
    readOnly: boolean;
    locale: string;
    required: string;
    choose: string;
    set(value: unknown): void;
    blur(): void;
}

function FieldInput({ field, value, error, readOnly, locale, required, choose, set, blur }: FieldProps) {
    const id = useId();
    const describedBy = [field.help ? `${id}-help` : undefined, error ? `${id}-error` : undefined].filter(Boolean).join(' ') || undefined;
    const common = { id, 'aria-invalid': error ? true : undefined, 'aria-required': field.required || undefined, 'aria-describedby': describedBy, disabled: readOnly, onBlur: blur } as const;
    const text = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
    let input;

    switch (field.type) {
        case FormFieldType.Toggle:
            input = <input {...common} type='checkbox' role='switch' checked={value === true} onChange={event => set(event.target.checked)} />;
            break;
        case FormFieldType.Select:
        case FormFieldType.Lookup:
            input = <select {...common} value={text} onChange={event => set(event.target.value)}><option value=''>{choose}</option>{field.options.map(option => <option key={option} value={option}>{option}</option>)}</select>;
            break;
        case FormFieldType.MultiSelect:
            input = (
                <fieldset className='foundation-fieldset' aria-describedby={describedBy} disabled={readOnly}>
                    {field.options.map(option => (
                        <label key={option} className='foundation-check'>
                            <input type='checkbox' checked={Array.isArray(value) && value.includes(option)} onBlur={blur}
                                onChange={event => set(event.target.checked ? [...(Array.isArray(value) ? value : []), option] : (Array.isArray(value) ? value : []).filter(candidate => candidate !== option))} />
                            <span>{option}</span>
                        </label>
                    ))}
                </fieldset>
            );
            break;
        case FormFieldType.RichText:
            input = <textarea {...common} rows={5} value={text} placeholder={field.placeholder} onChange={event => set(event.target.value)} />;
            break;
        case FormFieldType.File:
            input = <input {...common} type='file' onChange={event => set(Array.from(event.target.files ?? []).map(file => file.name))} />;
            break;
        case FormFieldType.Address: {
            const lines = typeof value === 'object' && value !== null ? (value as Record<string, string>) : {};
            input = (
                <div className='foundation-address' role='group' aria-describedby={describedBy}>
                    {addressLines.map(line => (
                        <input key={line} type='text' aria-label={`${field.label}: ${line}`} placeholder={line} disabled={readOnly} value={lines[line] ?? ''} onBlur={blur} onChange={event => set({ ...lines, [line]: event.target.value })} />
                    ))}
                </div>
            );
            break;
        }
        case FormFieldType.Number:
        case FormFieldType.Currency:
            input = <input {...common} type='number' inputMode='decimal' value={text} placeholder={field.placeholder} onChange={event => set(event.target.value === '' ? '' : Number(event.target.value))} />;
            break;
        case FormFieldType.Date:
            input = <input {...common} type='date' lang={locale} value={text} onChange={event => set(event.target.value)} />;
            break;
        default:
            input = <input {...common} type='text' value={text} placeholder={field.placeholder} onChange={event => set(event.target.value)} />;
    }

    const grouped = field.type === FormFieldType.MultiSelect || field.type === FormFieldType.Address;
    return (
        <div className='foundation-field' style={{ gridColumn: `span ${field.span}` }} data-invalid={error ? true : undefined}>
            {grouped ? <span className='foundation-field-label' id={`${id}-label`}>{field.label}{field.required && <span className='foundation-required' title={required}> *<span className='foundation-visually-hidden'> ({required})</span></span>}</span>
                : <label htmlFor={id} className='foundation-field-label'>{field.label}{field.required && <span className='foundation-required' title={required}> *<span className='foundation-visually-hidden'> ({required})</span></span>}</label>}
            {input}
            {field.help && <span id={`${id}-help`} className='foundation-count'>{field.help}</span>}
            {error && <span id={`${id}-error`} className='foundation-field-error' role='alert'>{error}</span>}
        </div>
    );
}

/**
 * The `formScreenBody` component: titled sections of fields in a one-to-three column grid, validated, with the Save / Save and new / Cancel bar and the
 * unsaved-changes guard.
 *
 * `sections` (`title`, `columns`, `fields`) and `values` come from the screen; a field is `text`, `number`, `currency`, `date`, `select`, `multiSelect`, `lookup`,
 * `toggle`, `file`, `richText` or `address`. Validation is inline on blur and a summary on submit (an alert listing each field as a link back to it); a server's
 * `errors` map onto the fields, and one for a field the form lacks is shown as a general error so it is never lost. Required fields are marked with an asterisk
 * *and* the word. `mode` is `create`, `edit`, `readOnly` or `settings` - settings has one Save for each section. The edited values are the `value` output; Save
 * runs the behaviors attached to the element. While values differ from the saved ones the form says so, warns the browser before the page is left, and offers
 * "Discard changes". The action bar sticks to the bottom as the form scrolls.
 */
export function FormScreenBody({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const sections = useMemo(() => readFormSections(element.properties.sections), [element.properties.sections]);
    const mode = readFormMode(element.properties.mode);
    const suppliedValues = (typeof element.properties.values === 'object' && element.properties.values !== null && !Array.isArray(element.properties.values) ? element.properties.values : {}) as FormValues;
    const suppliedKey = JSON.stringify(suppliedValues);
    const [saved, setSaved] = useState<FormValues>(suppliedValues);
    const [values, setValues] = useState<FormValues>(suppliedValues);
    const [touched, setTouched] = useState<Set<string>>(new Set());
    const [submitted, setSubmitted] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const summary = useRef<HTMLDivElement>(null);
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const state = readComponentState(element, sections.length > 0);
    const readOnly = mode === FormMode.ReadOnly || readPermissionRule(element, 'editPermission') !== 'enabled';
    const canSave = readPermissionRule(element, 'savePermission');
    const problems = validate(sections, values);
    const server = useMemo(() => mapServerErrors(sections, element.properties.errors), [sections, element.properties.errors]);
    const dirty = !sameValues(values, saved);
    const labelOf = (name: string) => sections.flatMap(section => section.fields).find(field => field.name === name)?.label ?? name;
    const wording = (name: string, kind: 'required' | 'invalid') => formatText(kind === 'required' ? strings.formRequiredField : strings.formInvalidField, { label: labelOf(name) });
    const errorOf = (name: string) => server.byField[name] ?? ((touched.has(name) || submitted) && problems[name] ? wording(name, problems[name]) : undefined);
    const invalid = Object.keys(problems);

    useEffect(() => { setSaved(suppliedValues); setValues(suppliedValues); setTouched(new Set()); setSubmitted(false); }, [suppliedKey]);
    useValueOutput(bindingOutputs, values);
    useEffect(() => {
        if (!dirty || typeof window === 'undefined') return;
        const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', guard);
        return () => window.removeEventListener('beforeunload', guard);
    }, [dirty]);

    const submit = (scope?: FormSection) => {
        setSubmitted(true);
        const scoped = scope ? scope.fields.filter(field => problems[field.name]) : invalid.map(name => ({ name }));
        if (scoped.length > 0) { requestAnimationFrame(() => summary.current?.focus()); return; }
        setSaved(values);
        setJustSaved(true);
        interactions?.onClick?.({ stopPropagation: () => undefined });
    };
    const edit = (name: string, value: unknown) => { setValues(current => ({ ...current, [name]: value })); setJustSaved(false); interactions?.onChange?.(); };

    return (
        <FoundationFrame element={element} interactions={interactions} name='form-screen' state={state} skeleton={[40, 100, 100, 70]}>
            {state !== ComponentState.Loading && (
                <form noValidate onSubmit={event => { event.preventDefault(); if (mode !== FormMode.Settings) submit(); }}>
                    {readOnly && mode === FormMode.ReadOnly && <p className='foundation-count' role='status'>{strings.formReadOnly}</p>}
                    {(submitted && invalid.length > 0 || server.general.length > 0) && (
                        <div ref={summary} tabIndex={-1} role='alert' className='foundation-message' data-tone='danger'>
                            <FoundationIcon name='alert' />
                            <div className='foundation-message-text'>
                                <strong>{invalid.length === 1 ? strings.formSummaryOne : formatText(strings.formSummary, { count: invalid.length })}</strong>
                                <ul>
                                    {invalid.map(name => <li key={name}>{wording(name, problems[name])}</li>)}
                                    {server.general.map(message => <li key={message}>{message}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                    {sections.map(section => (
                        <fieldset key={section.id} className='foundation-form-section' disabled={false}>
                            {section.title && <legend>{section.title}</legend>}
                            <div className='foundation-form-grid' style={{ gridTemplateColumns: `repeat(${section.columns}, minmax(0, 1fr))` }} data-columns={section.columns}>
                                {section.fields.map(field => (
                                    <FieldInput key={field.name} field={field} value={values[field.name]} error={errorOf(field.name)} readOnly={readOnly} locale={locale} required={strings.formRequired} choose={strings.formChoose}
                                        set={value => edit(field.name, value)} blur={() => setTouched(current => new Set(current).add(field.name))} />
                                ))}
                            </div>
                            {mode === FormMode.Settings && !readOnly && (
                                <div className='foundation-form-section-actions'>
                                    <ActionButton rule={canSave} emphasis='secondary' disabledReason={strings.disabledNoPermission} onClick={() => submit(section)}>{formatText(strings.formSectionSave, { section: section.title })}</ActionButton>
                                </div>
                            )}
                        </fieldset>
                    ))}
                    {mode !== FormMode.Settings && mode !== FormMode.ReadOnly && (
                        <div className='foundation-form-actions' role='group' aria-label={strings.listActions}>
                            <span role='status' className='foundation-count'>{dirty ? strings.formUnsaved : justSaved ? strings.formSaved : ''}</span>
                            <span className='foundation-wizard-spacer' />
                            {dirty && <ActionButton emphasis='quiet' disabledReason={strings.disabledNoPermission} onClick={() => { setValues(saved); setTouched(new Set()); setSubmitted(false); }}>{strings.formDiscard}</ActionButton>}
                            <ActionButton emphasis='secondary' disabledReason={strings.disabledNoPermission} onClick={() => interactions?.onClick?.({ stopPropagation: () => undefined })}>{strings.formCancel}</ActionButton>
                            {mode === FormMode.Create && <ActionButton rule={canSave} emphasis='secondary' disabledReason={strings.disabledNoPermission} onClick={() => { submit(); }}>{strings.formSaveAndNew}</ActionButton>}
                            <ActionButton rule={canSave} disabledReason={strings.disabledNoPermission} onClick={() => submit()}>{strings.formSave}</ActionButton>
                        </div>
                    )}
                </form>
            )}
        </FoundationFrame>
    );
}
