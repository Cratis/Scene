// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import './DesignTimeData.css';
import { createElement, type ComponentType } from 'react';
import { componentRegistryKey, type ComponentRegistry, type RegisteredComponentProps } from '@cratis/scene.react';
import { previewFieldsOf } from '../../../Preview/previewDataView';
import { sampleCellValue, sampleRows } from './sampleCellValue';
import { FormFields } from '../../Forms/FormFields';

const rowNumbers = Array.from({ length: sampleRows }, (_, index) => index);

// A screenplay table is the structural shell - its column headings - and leaves the rows to the host. At design time there is no query behind it, so the
// surface draws it as a table with a few sample rows, the way the preview draws it with the sample data pack.
const designTimeTable = (own: ComponentType<RegisteredComponentProps> | undefined) => function DesignTimeTable(props: RegisteredComponentProps) {
    const { element } = props;
    const columns = previewFieldsOf(element, 'columns');

    // A table the author dropped from the palette has no columns of a screenplay: it keeps the profile's own drawing, with its sample rows.
    if (columns.length === 0 && own) return createElement(own, props);
    return (
        <section data-scene-id={element.id} data-design-data='table' className='studio-design-data'>
            <table role='table'>
                <thead><tr role='row'>{columns.map(column => <th key={column.property} role='columnheader'>{column.label}</th>)}</tr></thead>
                <tbody>{rowNumbers.map(row => <tr key={row} role='row'>{columns.map(column => <td key={column.property}>{sampleCellValue(column.property, row)}</td>)}</tr>)}</tbody>
            </table>
        </section>
    );
};

// A screenplay summary is its field labels; at design time each gets a sample value.
const designTimeSummary = (own: ComponentType<RegisteredComponentProps> | undefined) => function DesignTimeSummary(props: RegisteredComponentProps) {
    const { element } = props;
    const fields = previewFieldsOf(element, 'fields');
    if (fields.length === 0 && own) return createElement(own, props);

    // The fields of a command form are its inputs, on the grid its layout declares - as the preview draws the form.
    if (element.properties?.form === true) {
        return (
            <div data-scene-id={element.id} data-design-data='form'>
                <FormFields readOnly layout={element.properties.layout} fields={fields.map(field => ({ name: field.property, label: field.label, value: sampleCellValue(field.property, 0) }))} />
            </div>
        );
    }

    return (
        <dl data-scene-id={element.id} data-design-data='summary' className='studio-design-data studio-design-data--summary'>
            {fields.map(field => <div key={field.property}><dt>{field.label}</dt><dd>{sampleCellValue(field.property, 0)}</dd></div>)}
        </dl>
    );
};

/**
 * The components the surface draws a screenplay table and summary with: the heading and labels the screen says, over sample rows and values.
 *
 * @param registry The runtime's registry, whose own table and summary draw what is not a screenplay's.
 * @returns The registry entries that replace Scene's two for design time.
 */
export function designTimeDataComponents(registry: ComponentRegistry): ComponentRegistry {
    const table = componentRegistryKey('core', 'table');
    const summary = componentRegistryKey('core', 'summary');
    return {
        [table]: designTimeTable(registry[table]),
        [summary]: designTimeSummary(registry[summary]),
    };
}
