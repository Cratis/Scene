// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Behavior, BindingExpression } from '@cratis/scene.model';
import { useMemo } from 'react';
import { InteractionScope, componentRegistryKey, useInteractions, useOptionalSceneNavigation, useRenderBindingScope, type ComponentRegistry, type RegisteredComponentProps } from '@cratis/scene.react';
import { cellText, previewDataSourcesOf, previewFieldsOf, previewRowDispatcher, queryOfTypeName, resolveInRow, rowsOfQueryResult, type PreviewDataField, type PreviewDataSource } from './previewDataView';

const typeNameOf = (props: RegisteredComponentProps): string | undefined => {
    const typeName = props.element.properties?.typeName;
    return typeof typeName === 'string' ? typeName : undefined;
};

interface PreviewRowProps {
    id: string;
    behaviors: Behavior[] | undefined;
    row: Record<string, unknown>;
    columns: readonly PreviewDataField[];
}

/** One row, which does what the table's `on click` and `on double click` say - with the row as `item` - when a person works with it. */
function PreviewRowBody({ id, behaviors, row, columns }: PreviewRowProps) {
    const handlers = useInteractions(id, behaviors);
    const interactive = handlers.onClick !== undefined || handlers.onDoubleClick !== undefined;
    return (
        <tr role='row' {...handlers} className={interactive ? 'studio-preview-data__row--interactive' : undefined}>
            {columns.map(column => <td key={column.property}>{cellText(row[column.property])}</td>)}
        </tr>
    );
}

function PreviewRow(props: PreviewRowProps) {
    const navigation = useOptionalSceneNavigation();
    const dispatcher = useMemo(() => previewRowDispatcher(navigation), [navigation]);
    const context = useMemo(() => ({ resolve: resolveInRow<BindingExpression>(props.row, () => undefined) }), [props.row]);
    if (props.behaviors === undefined || props.behaviors.length === 0) {
        return <tr role='row'>{props.columns.map(column => <td key={column.property}>{cellText(props.row[column.property])}</td>)}</tr>;
    }

    return (
        <InteractionScope dispatcher={dispatcher} attachments={[]} context={context}>
            <PreviewRowBody {...props} />
        </InteractionScope>
    );
}

const PreviewTable = (sources: readonly PreviewDataSource[]) => function PreviewTable(props: RegisteredComponentProps) {
    const scope = useRenderBindingScope();
    const typeName = typeNameOf(props);
    const query = typeName === undefined ? undefined : queryOfTypeName(sources, typeName, true);
    const rows = rowsOfQueryResult(query === undefined ? undefined : scope.queryResults?.[query]);
    const columns = previewFieldsOf(props.element, 'columns');

    return (
        <section data-scene-id={props.element.id} data-preview-rows={rows.length} data-preview-query={query} className='studio-preview-data'>
            <table role='table'>
                <thead><tr role='row'>{columns.map(column => <th key={column.property} role='columnheader'>{column.label}</th>)}</tr></thead>
                <tbody>{rows.map((row, index) => <PreviewRow key={index} id={props.element.id} behaviors={props.element.behaviors} row={row} columns={columns} />)}</tbody>
            </table>
        </section>
    );
};

const PreviewSummary = (sources: readonly PreviewDataSource[]) => function PreviewSummary(props: RegisteredComponentProps) {
    const scope = useRenderBindingScope();
    const typeName = typeNameOf(props);
    const query = typeName === undefined ? undefined : queryOfTypeName(sources, typeName, false);
    const record = rowsOfQueryResult(query === undefined ? undefined : scope.queryResults?.[query])[0];
    const fields = previewFieldsOf(props.element, 'fields');

    return (
        <dl data-scene-id={props.element.id} data-preview-rows={record === undefined ? 0 : 1} data-preview-query={query} className='studio-preview-data studio-preview-data--summary'>
            {fields.map(field => <div key={field.property}><dt>{field.label}</dt><dd>{record === undefined ? '' : cellText(record[field.property])}</dd></div>)}
        </dl>
    );
};

/**
 * The components the preview draws a screenplay table and summary with.
 *
 * Scene's `core:table` and `core:summary` are the structural shell of what the screen says - the column headings, the field labels - and leave the rows to the
 * host: Stage's generated application reads a query and draws them. The preview host has the sample data of every query the screens read in the scope it
 * renders in, and nothing that draws it, so a table showed its headings over nothing. These two read the rows of the query whose data element yields the same
 * read model from the scope, and draw them; a table shows every row, a summary the first.
 *
 * @param content The screens, templates and layouts the preview draws, which hold the data elements.
 * @returns The registry entries that replace Scene's two.
 */
export function previewDataComponents(content: unknown): ComponentRegistry {
    const sources = previewDataSourcesOf(content);
    return {
        [componentRegistryKey('core', 'table')]: PreviewTable(sources),
        [componentRegistryKey('core', 'summary')]: PreviewSummary(sources),
    };
}
