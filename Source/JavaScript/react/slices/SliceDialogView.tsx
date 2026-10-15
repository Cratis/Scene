// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormEvent, KeyboardEvent, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { SceneNavigationContextInternal } from '../navigation/SceneNavigationContext';
import { useSceneNavigationModel } from '../navigation/region/SceneNavigationModelContext';
import { InvocationResult } from './InvocationResult';
import { InvocationValidationError } from './InvocationValidationError';
import { SliceCommandField } from './SliceCommandField';
import { useSliceCommandFields } from './SliceCommandFieldsContext';
import { useSliceInvoker } from './SliceInvokerContext';
import { sliceDialogParameters } from './sliceDialogDestination';

export interface SliceDialogViewProps {
    /** The qualified id of the slice; the open dialog's `slice` parameter when absent. */
    slice?: string;

    /** The command the slice accepts; the open dialog's `command` parameter when absent. */
    command?: string;

    /** The title - the toolbar button's - also the label of the submit button; the open dialog's `title` parameter when absent. */
    title?: string;

    /** Called when the dialog is cancelled or the slice accepted the command; the host's `closeDialog` when absent. */
    onClose?(result?: InvocationResult): void;
}

const focusable = 'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

/** A label for a command property: `customerName` becomes `Customer name`. */
export function sliceFieldLabel(field: SliceCommandField): string {
    if (field.label) return field.label;
    const spaced = field.name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').trim().toLowerCase();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function inputTypeOf(field: SliceCommandField): string {
    switch (field.type.toLowerCase()) {
        case 'number': case 'int': case 'integer': case 'long': case 'double': case 'decimal': case 'float': case 'single': case 'int32': case 'int64': return 'number';
        case 'boolean': case 'bool': return 'checkbox';
        case 'date': case 'dateonly': return 'date';
        default: return 'text';
    }
}

/** The payload a form's values make: numbers and booleans as such, an empty number left out. */
export function slicePayload(fields: SliceCommandField[], values: Record<string, string | boolean>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
        const value = values[field.name];
        const type = inputTypeOf(field);
        if (type === 'checkbox') payload[field.name] = value === true;
        else if (type === 'number') { if (value !== undefined && value !== '') payload[field.name] = Number(value); }
        else payload[field.name] = value ?? '';
    }

    return payload;
}

/**
 * The task dialog of a toolbar slice button (TB4): a modal card with the button's title, the slice as its subtitle, a labelled
 * field for each command property, and Cancel and a submit button labelled with the title.
 *
 * - The first field takes focus when it opens, Tab stays inside, Escape cancels, and focus returns to the button that opened it.
 * - Submit validates required fields, then calls the `SliceInvoker` in scope - real, dry-run or the announcing default. The
 *   problems it reports are shown against their fields (`aria-invalid`, `aria-describedby`) or for the form; success closes the
 *   dialog and hands the result to the host (`dialogResult`).
 * - The fields come from the `SliceCommandFieldsProvider`; the subtitle names the slice from the navigation model.
 *
 * Inside a navigation host it is the content of the dialog a toolbar button opens; `core:sliceDialog` registers it so a host can
 * author the dialog template with it.
 */
export function SliceDialogView({ slice: sliceProp, command: commandProp, title: titleProp, onClose }: SliceDialogViewProps) {
    const navigation = useContext(SceneNavigationContextInternal);
    const opened = sliceDialogParameters(navigation?.currentDialogParameters);
    const slice = sliceProp ?? opened?.slice ?? '';
    const command = commandProp ?? opened?.command ?? slice;
    const title = titleProp ?? opened?.title ?? command;

    const invoker = useSliceInvoker();
    const fieldsFor = useSliceCommandFields();
    const model = useSceneNavigationModel();
    const fields = useMemo(() => fieldsFor?.(command, slice) ?? [], [command, fieldsFor, slice]);
    const sliceName = useMemo(() => {
        if (!model) return slice.split('.').pop() ?? slice;
        const index = model.structure instanceof ApplicationStructureIndex ? model.structure : new ApplicationStructureIndex(model.structure);
        return index.findSlice(slice)?.id ?? slice.split('.').pop() ?? slice;
    }, [model, slice]);

    const [values, setValues] = useState<Record<string, string | boolean>>({});
    const [errors, setErrors] = useState<InvocationValidationError[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const form = useRef<HTMLFormElement>(null);
    const identity = useId();

    const close = (result?: InvocationResult) => onClose ? onClose(result) : navigation?.closeDialog(result);

    // Focus the first field, and give focus back to whatever opened the dialog when it goes.
    useEffect(() => {
        const opener = document.activeElement as HTMLElement | null;
        (form.current?.querySelector<HTMLElement>('input, select, textarea') ?? form.current?.querySelector<HTMLElement>('button'))?.focus();
        return () => { if (opener && opener.isConnected) opener.focus(); };
    }, []);

    const errorsOf = (name: string | undefined) => errors.filter(error => error.field === name);
    const fieldNames = new Set(fields.map(field => field.name));
    const general = errors.filter(error => error.field === undefined || !fieldNames.has(error.field));

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (submitting) return;

        const missing = fields.filter(field => field.required && (values[field.name] === undefined || values[field.name] === '')).map(field => ({ field: field.name, message: `${sliceFieldLabel(field)} is required.` }));
        setErrors(missing);
        if (missing.length > 0) {
            form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
            return;
        }

        setSubmitting(true);
        try {
            const result = await invoker.invoke(slice, slicePayload(fields, values), command);
            if (result.succeeded) {
                close(result);
            } else {
                const reported = result.validationErrors ?? [];
                setErrors(reported.length > 0 || !result.message ? reported : [{ message: result.message }]);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        } else if (event.key === 'Tab') {
            const targets = Array.from(form.current?.querySelectorAll<HTMLElement>(focusable) ?? []);
            if (targets.length === 0) return;
            const first = targets[0];
            const last = targets[targets.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    };

    return <form ref={form} className='scene-slice-dialog' data-scene-slice-dialog={slice} data-scene-command={command} noValidate onSubmit={submit} onKeyDown={onKeyDown}>
        <header className='scene-slice-dialog-header'>
            <h2 className='scene-slice-dialog-title'>{title}</h2>
            <p className='scene-slice-dialog-subtitle'>State Change · {sliceName}</p>
        </header>
        <div className='scene-slice-dialog-fields'>
            {fields.map(field => {
                const id = `${identity}-${field.name}`;
                const own = errorsOf(field.name);
                const type = inputTypeOf(field);
                const description = own.length > 0 ? `${id}-error` : undefined;
                return <div key={field.name} className='scene-slice-dialog-field' data-type={type}>
                    <label htmlFor={id}>{sliceFieldLabel(field)}{field.required ? <span aria-hidden='true'> *</span> : null}</label>
                    <input id={id} name={field.name} type={type} required={field.required} aria-required={field.required || undefined}
                        aria-invalid={own.length > 0 ? true : undefined} aria-describedby={description}
                        {...(type === 'checkbox' ? { checked: values[field.name] === true } : { value: (values[field.name] as string | undefined) ?? '' })}
                        onChange={event => setValues({ ...values, [field.name]: type === 'checkbox' ? event.target.checked : event.target.value })} />
                    {own.length > 0 && <p id={description} className='scene-slice-dialog-error' role='alert'>{own.map(error => error.message).join(' ')}</p>}
                </div>;
            })}
        </div>
        {general.length > 0 && <p className='scene-slice-dialog-error scene-slice-dialog-summary' role='alert'>{general.map(error => error.message).join(' ')}</p>}
        <footer className='scene-slice-dialog-footer'>
            <button type='button' className='scene-slice-dialog-cancel' onClick={() => close()}>Cancel</button>
            <button type='submit' className='scene-slice-dialog-submit' disabled={submitting}>{title}</button>
        </footer>
    </form>;
}
