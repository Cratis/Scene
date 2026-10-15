// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The field types a form offers (Part B 2.8). */
export enum FormFieldType {
    Text = 'text',
    Number = 'number',
    Currency = 'currency',
    Date = 'date',
    Select = 'select',
    MultiSelect = 'multiSelect',
    Lookup = 'lookup',
    Toggle = 'toggle',
    File = 'file',
    RichText = 'richText',
    Address = 'address',
    Password = 'password',
}

/** One field of a form section. */
export interface FormField {
    name: string;
    label: string;
    type: FormFieldType;
    required: boolean;
    options: string[];
    /** The columns of the section grid the field spans (1 to 3). */
    span: number;
    placeholder?: string;
    help?: string;
}

/** A titled group of fields in a grid of one to three columns. */
export interface FormSection {
    id: string;
    title: string;
    columns: number;
    fields: FormField[];
}

/** The values of a form by field name; a multi-select is an array, a toggle a boolean, an address an object of lines. */
export type FormValues = Record<string, unknown>;

/** The ways the one form can be used (Part B 2.8). */
export enum FormMode {
    Create = 'create',
    Edit = 'edit',
    ReadOnly = 'readOnly',
    Settings = 'settings',
}

/** The lines of an address, in the order they are asked. */
export const addressLines = ['street', 'postalCode', 'city', 'country'] as const;

const records = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.filter((entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null && !Array.isArray(entry)) : [];

/** Reads the mode, defaulting to create. */
export const readFormMode = (value: unknown): FormMode => ((Object.values(FormMode) as string[]).includes(value as string) ? (value as FormMode) : FormMode.Create);

/** Reads sections, with their fields, dropping fields without a name and repeated names; a section grid is clamped to one to three columns. */
export function readFormSections(value: unknown): FormSection[] {
    const names = new Set<string>();
    return records(value).flatMap((section, index) => {
        const columns = typeof section.columns === 'number' ? Math.min(3, Math.max(1, Math.floor(section.columns))) : 1;
        const fields = records(section.fields).flatMap((entry): FormField[] => {
            if (typeof entry.name !== 'string' || entry.name.length === 0 || names.has(entry.name)) return [];
            names.add(entry.name);
            return [{
                name: entry.name,
                label: typeof entry.label === 'string' && entry.label.length > 0 ? entry.label : entry.name,
                type: (Object.values(FormFieldType) as string[]).includes(entry.type as string) ? (entry.type as FormFieldType) : FormFieldType.Text,
                required: entry.required === true,
                options: Array.isArray(entry.options) ? entry.options.filter((option): option is string => typeof option === 'string') : [],
                span: typeof entry.span === 'number' ? Math.min(columns, Math.max(1, Math.floor(entry.span))) : 1,
                ...(typeof entry.placeholder === 'string' ? { placeholder: entry.placeholder } : {}),
                ...(typeof entry.help === 'string' ? { help: entry.help } : {}),
            }];
        });
        return [{ id: typeof section.id === 'string' && section.id.length > 0 ? section.id : `section-${index}`, title: typeof section.title === 'string' ? section.title : '', columns, fields }];
    });
}

/** Whether a field holds a value: an empty or blank text, an empty list, a toggle left false (a required toggle must be on) or an address with no street and city are empty. */
export function isFilled(field: FormField, value: unknown): boolean {
    switch (field.type) {
        case FormFieldType.Toggle: return value === true;
        case FormFieldType.MultiSelect: return Array.isArray(value) && value.length > 0;
        case FormFieldType.File: return Array.isArray(value) ? value.length > 0 : typeof value === 'string' && value.trim().length > 0;
        case FormFieldType.Address: return typeof value === 'object' && value !== null && ['street', 'city'].every(line => typeof (value as Record<string, unknown>)[line] === 'string' && ((value as Record<string, unknown>)[line] as string).trim().length > 0);
        case FormFieldType.Number: case FormFieldType.Currency: return typeof value === 'number' ? Number.isFinite(value) : typeof value === 'string' && value.trim().length > 0 && Number.isFinite(Number(value));
        default: return typeof value === 'string' ? value.trim().length > 0 : value !== undefined && value !== null && value !== '';
    }
}

/** Why a field is invalid, as a kind the component words in the locale: `required`, `invalid`, or undefined when it is fine. An empty optional field is fine. */
export function problemOf(field: FormField, value: unknown): 'required' | 'invalid' | undefined {
    if (!isFilled(field, value)) {
        const empty = value === undefined || value === null || value === '' || (typeof value === 'string' && value.trim() === '') || (Array.isArray(value) && value.length === 0) || value === false;
        return field.required ? 'required' : empty ? undefined : 'invalid';
    }

    if (field.type === FormFieldType.Date && typeof value === 'string' && Number.isNaN(new Date(value).getTime())) return 'invalid';
    if ((field.type === FormFieldType.Select || field.type === FormFieldType.Lookup) && field.options.length > 0 && typeof value === 'string' && !field.options.includes(value)) return 'invalid';
    return undefined;
}

/** The problems of every field, by field name, for the fields in the given sections. */
export function validate(sections: FormSection[], values: FormValues): Record<string, 'required' | 'invalid'> {
    const problems: Record<string, 'required' | 'invalid'> = {};
    for (const field of sections.flatMap(section => section.fields)) {
        const problem = problemOf(field, values[field.name]);
        if (problem) problems[field.name] = problem;
    }

    return problems;
}

/** Whether two sets of values are the same, field by field and in depth, so the unsaved-changes guard compares what the person sees. */
export function sameValues(left: FormValues, right: FormValues): boolean {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    return [...keys].every(key => JSON.stringify(normalizeValue(left[key])) === JSON.stringify(normalizeValue(right[key])));
}

function normalizeValue(value: unknown): unknown {
    if (value === undefined || value === null || value === '' || value === false) return null;
    if (Array.isArray(value)) return value.length === 0 ? null : value;
    if (typeof value === 'object') { const entries = Object.entries(value as Record<string, unknown>).filter(([, line]) => line !== '' && line !== undefined).sort(([a], [b]) => a.localeCompare(b)); return entries.length === 0 ? null : entries; }
    return value;
}

/** Maps a server's field errors (`{ field: message }` or `[{ field, message }]`) onto the fields of the form; an error for a field the form does not have is returned as a general one so it is never lost. */
export function mapServerErrors(sections: FormSection[], errors: unknown): { byField: Record<string, string>; general: string[] } {
    const known = new Set(sections.flatMap(section => section.fields.map(field => field.name)));
    const pairs: [string, string][] = Array.isArray(errors)
        ? records(errors).flatMap(entry => (typeof entry.message === 'string' ? [[typeof entry.field === 'string' ? entry.field : '', entry.message] as [string, string]] : []))
        : typeof errors === 'object' && errors !== null ? Object.entries(errors as Record<string, unknown>).flatMap(([field, message]) => (typeof message === 'string' ? [[field, message] as [string, string]] : [])) : [];

    const byField: Record<string, string> = {};
    const general: string[] = [];
    for (const [field, message] of pairs) {
        if (known.has(field) && byField[field] === undefined) byField[field] = message;
        else general.push(field && !known.has(field) ? `${field}: ${message}` : message);
    }

    return { byField, general };
}
