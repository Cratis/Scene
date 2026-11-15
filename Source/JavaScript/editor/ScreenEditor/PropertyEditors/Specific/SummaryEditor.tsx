// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isRecord } from '../Structured/structuredValue';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// What a property whose editing belongs to a component's own editor looks like in the generic list: a one-line summary of what it holds and
// where it is edited - never JSON text, and never silence. The command form's layout, field widths and placements are drawn by the command
// form section; the layout types' sizes and grid definitions by the layout section.
const summaryOf = (value: unknown): string => {
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) return `${value.length}`;
    if (isRecord(value)) return Object.keys(value).length === 0 ? '' : Object.keys(value).join(', ');
    return String(value);
};

export const SummaryEditor = ({ value, descriptor, context, id }: PropertyEditorProps<unknown>) => {
    const text = context.strings.editors.summary;
    const summary = summaryOf(value);
    return (
        <p id={id} className='studio-editor-summary'>
            <span>{summary === '' ? text.empty : summary}</span>
            <small className='studio-editor-properties__hint'>{text.editedBy(ownerOf(descriptor.editorKind))}</small>
        </p>
    );
};

const owners: Record<string, string> = {
    commandFormLayout: 'the Command form section', fieldWidths: 'the Command form section', commandFields: 'the Command form section', commandFormFieldPlacement: 'the Command form section',
    size: 'the Layout section', gridDefinitions: 'the Layout section',
};

const ownerOf = (kind: string | undefined): string => (kind !== undefined ? owners[kind] : undefined) ?? 'its own editor';
