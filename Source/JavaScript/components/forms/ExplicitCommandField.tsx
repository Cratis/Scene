// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useId, useLayoutEffect, useRef, useState } from 'react';
import { asCommandFormField, useCommandFormContext } from '@cratis/arc.react/commands';
import { Guid } from '@cratis/fundamentals';
import type { CommandInput } from './commandInputs';

interface TextProps {
    value: unknown;
    onChange: (value: unknown) => void;
    onBlur?: () => void;
    invalid: boolean;
    required: boolean;
    errors: string[];
    label: string;
    property: string;
    guid: boolean;
}

function TextControl({ value, onChange, onBlur, invalid, required, errors, label, property, guid }: TextProps) {
    const id = useId();
    const context = useCommandFormContext();
    const { setCustomFieldError } = context;
    // Keep the latest native getter: the context snapshot can be stale when another field sets an
    // error and this field unmounts in the same event.
    const contextRef = useRef(context);
    contextRef.current = context;
    // The draft is intentionally independent of the typed proxy value: malformed text must never
    // reappear as a stale previously valid Guid in the command's serialized payload.
    const [draft, setDraft] = useState(() => value instanceof Guid && !value.equals(Guid.empty) ? value.toString() : '');
    const draftRef = useRef(draft);
    const ownedError = useRef<string | undefined>(undefined);
    const updateError = (error: string | undefined) => {
        const current = contextRef.current.getFieldError(property);
        // Do not replace or erase another producer's error for this field.
        if (ownedError.current !== undefined && current !== ownedError.current) {
            ownedError.current = undefined;
            return;
        }
        if (ownedError.current === undefined && Object.hasOwn(contextRef.current.customFieldErrors, property)) return;
        if (error === undefined && ownedError.current === undefined) return;
        ownedError.current = error;
        setCustomFieldError(property, error);
    };
    // A label/required change must recalculate the message without disposing the field's error.
    // Only a different field/type or an actual unmount relinquishes ownership.
    useLayoutEffect(() => () => {
        if (ownedError.current !== undefined && contextRef.current.getFieldError(property) === ownedError.current) {
            contextRef.current.setCustomFieldError(property, undefined);
        }
        ownedError.current = undefined;
    }, [property, guid]);
    useLayoutEffect(() => {
        if (guid) {
            const current = draftRef.current || (value instanceof Guid && !value.equals(Guid.empty) ? value.toString() : '');
            updateError(!current ? required ? `${label} is required` : undefined :
                !Guid.isGuid(current) ? `${label} must be a valid GUID` : undefined);
        }
    }, [guid, required, property, label, setCustomFieldError]);
    const text = guid ? draft : typeof value === 'string' ? value : '';
    return <div>
        <label htmlFor={id}>{label}</label>
        <input id={id} name={property} type='text' required={required} value={text}
            aria-invalid={invalid} aria-describedby={errors.length ? `${id}-error` : undefined}
            onBlur={onBlur} onChange={event => {
                const next = event.currentTarget.value;
                if (!guid) { onChange(next); return; }
                draftRef.current = next;
                setDraft(next);
                const error = !next ? required ? `${label} is required` : undefined : !Guid.isGuid(next) ? `${label} must be a valid GUID` : undefined;
                // A malformed draft clears the previously typed value, not just its display.
                onChange(error || !next ? undefined : Guid.parse(next));
                updateError(error);
            }} />
        {errors.length > 0 && <div id={`${id}-error`} role='alert'>{errors[0]}</div>}
    </div>;
}

const NativeTextField = asCommandFormField<TextProps>(TextControl, { defaultValue: '' });

/** Opaque child is self-bound by Arc's native runtime binding, with an exact fieldName. */
export function ExplicitCommandField({ input }: { input: CommandInput }) {
    return <NativeTextField fieldName={input.property} value={(command: Record<string, unknown>) => command[input.property]}
        property={input.property} guid={input.type === 'guid'} label={input.label} title={input.label} />;
}
