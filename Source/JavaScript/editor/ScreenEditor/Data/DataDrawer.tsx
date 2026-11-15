// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DragEvent, ReactNode } from 'react';
import { beginMenuDrag, endMenuDrag } from '../Menu/menuDrag';
import { MenuPopover } from '../Menu/MenuPopover';
import { setPaletteDrag } from '../Surface/dragPayload';
import type { CommandContext } from './commandContext';
import { dataFieldKey, dataFieldLabel, type DataField, type QueryDataField, type QueryResultDataField, type ScreenData } from './DataField';
import './DataDrawer.css';

export interface DataDrawerStrings {
    title: string;
    closeLabel: string;
    hint: string;
    command: (name: string) => string;
    queries: string;
    noCommand: string;
    noQueries: string;
    addLabel: (field: string) => string;
    placed: string;
    notPlaced: string;
    required: string;
    picker: (query: string, show: string) => string;
    generateForm: string;
    formComplete: string;
    queryShape: Record<QueryResultDataField['shape'], string>;
    addQueryLabel: (query: string, shape: string) => string;
    columnShown: string;
    columnHidden: string;
}

export interface DataDrawerProps {
    data: ScreenData;

    // The screen's command, with what the screen's form places of it.
    command?: CommandContext;
    icon: ReactNode;
    strings: DataDrawerStrings;
    disabled?: boolean;
    // Draws the button with its name beside the icon; `disabledReason` is its title while the drawer is disabled.
    labelled?: boolean;
    disabledReason?: string;
    onAdd: (field: DataField) => void;

    // Whether a field a query returns is a column of a table on the screen, so the row can show it and take it off again.
    isShown?: (field: QueryDataField) => boolean;
    onRemove?: (field: QueryDataField) => void;
    onGenerate?: () => void;
}

const startDrag = (field: DataField, event: DragEvent<HTMLButtonElement>) => {
    setPaletteDrag(event, { kind: 'field', field }, dataFieldLabel(field));
    beginMenuDrag(event.currentTarget);
};
const endDrag = (event: DragEvent<HTMLButtonElement>) => {
    endMenuDrag(event.currentTarget);
};

interface RowProps {
    field: DataField;
    label: string;
    title: string;
    disabled: boolean;
    pressed?: boolean;
    className?: string;
    onActivate: () => void;
    children: ReactNode;
}

const Row = ({ field, label, title, disabled, pressed, className = '', onActivate, children }: RowProps) => (
    <li>
        <button type='button' className={`studio-data-drawer__field ${className}`.trim()} draggable={!disabled} disabled={disabled} data-data-field={dataFieldKey(field)} data-label={label} title={title}
            aria-pressed={pressed} onClick={onActivate} onDragStart={event => startDrag(field, event)} onDragEnd={endDrag}>
            {children}
        </button>
    </li>
);

const CommandSection = ({ command, strings, disabled, onAdd, onGenerate }: { command: CommandContext; strings: DataDrawerStrings; disabled: boolean; onAdd: (field: DataField) => void; onGenerate?: () => void }) => (
    <section className='studio-data-drawer__group' aria-label={strings.command(command.name)} data-data-command={command.name}>
        <h3 className='studio-data-drawer__heading'>{strings.command(command.name)}</h3>
        <ul className='studio-data-drawer__fields'>
            {command.properties.map(property => (
                <Row key={dataFieldKey(property.field)} field={property.field} label={property.field.property} title={strings.addLabel(property.field.property)} disabled={disabled}
                    className={property.placed ? 'studio-data-drawer__field--placed' : ''} onActivate={() => onAdd(property.field)}>
                    <span className='studio-data-drawer__state' data-placed={property.placed} title={property.placed ? strings.placed : strings.notPlaced} role='img' aria-label={property.placed ? strings.placed : strings.notPlaced}>{property.placed ? '✓' : '⋮⋮'}</span>
                    <span className='studio-data-drawer__name'>{property.field.property}</span>
                    <span className='studio-data-drawer__type'>{property.field.type}</span>
                    {property.choices && <span className='studio-data-drawer__note' data-note='picker' title={strings.picker(property.choices.query, property.choices.show)}>{strings.picker(property.choices.query, property.choices.show)}</span>}
                    {property.required && <span className='studio-data-drawer__note' data-note='required'>{strings.required}</span>}
                </Row>
            ))}
        </ul>
        {onGenerate && (
            <button type='button' className='studio-data-drawer__generate' disabled={disabled || command.complete} onClick={onGenerate}>
                {command.complete ? strings.formComplete : strings.generateForm}
            </button>
        )}
    </section>
);

// The Data drawer: what the screen can be bound to - the command it submits first, with each property's concept and whether the form places it, then
// what the queries the slice can read return. Dragging one onto the screen, or clicking it, makes a field bound to it; dragging a whole query makes
// a table or a summary of it, and ticking a field of a list makes it a column.
export const DataDrawer = ({ data, command, icon, strings, disabled = false, labelled = false, disabledReason, onAdd, isShown, onRemove, onGenerate }: DataDrawerProps) => (
    <MenuPopover className='studio-palette-folder studio-data-drawer-folder' icon={icon} title={strings.title} heading={strings.title} closeLabel={strings.closeLabel} disabled={disabled} {...(labelled ? { label: strings.title } : {})} {...(disabledReason ? { disabledReason } : {})}>
        <div className='studio-data-drawer' role='region' aria-label={strings.title}>
            <p className='studio-data-drawer__hint'>{strings.hint}</p>
            {command
                ? <CommandSection command={command} strings={strings} disabled={disabled} onAdd={onAdd} onGenerate={onGenerate} />
                : data.command
                    ? (
                        <section className='studio-data-drawer__group' aria-label={strings.command(data.command.name)}>
                            <h3 className='studio-data-drawer__heading'>{strings.command(data.command.name)}</h3>
                            <ul className='studio-data-drawer__fields'>
                                {data.command.fields.map(field => (
                                    <Row key={dataFieldKey(field)} field={field} label={field.property} title={strings.addLabel(field.property)} disabled={disabled} onActivate={() => onAdd(field)}>
                                        <span className='studio-data-drawer__name'>{field.property}</span>
                                        <span className='studio-data-drawer__type'>{field.type}</span>
                                    </Row>
                                ))}
                            </ul>
                        </section>
                    )
                    : <p className='studio-data-drawer__empty' role='status'>{strings.noCommand}</p>}
            {data.queries.length > 0
                ? data.queries.map(query => {
                    const whole: QueryResultDataField = { source: 'queryResult', queryId: query.id, query: query.name, shape: query.shape };
                    return (
                        <section key={query.id} className='studio-data-drawer__group' aria-label={query.name} data-data-query={query.name}>
                            <ul className='studio-data-drawer__fields'>
                                <Row field={whole} label={query.name} title={strings.addQueryLabel(query.name, strings.queryShape[query.shape])} disabled={disabled} className='studio-data-drawer__query' onActivate={() => onAdd(whole)}>
                                    <span className='studio-data-drawer__name'>{query.name}</span>
                                    <span className='studio-data-drawer__type'>{strings.queryShape[query.shape]}</span>
                                </Row>
                            </ul>
                            <ul className='studio-data-drawer__fields'>
                                {query.fields.map(field => {
                                    const shown = query.shape === 'collection' && isShown ? isShown(field) : undefined;
                                    return (
                                        <Row key={dataFieldKey(field)} field={field} label={dataFieldLabel(field)} title={shown ? strings.columnShown : strings.addLabel(dataFieldLabel(field))} disabled={disabled} pressed={shown}
                                            onActivate={() => shown && onRemove ? onRemove(field) : onAdd(field)}>
                                            {shown !== undefined && <span className='studio-data-drawer__state' data-placed={shown} role='img' aria-label={shown ? strings.columnShown : strings.columnHidden}>{shown ? '✓' : '☐'}</span>}
                                            <span className='studio-data-drawer__name'>{field.field}</span>
                                            <span className='studio-data-drawer__type'>{field.type}</span>
                                        </Row>
                                    );
                                })}
                            </ul>
                        </section>
                    );
                })
                : <p className='studio-data-drawer__empty' role='status'>{strings.noQueries}</p>}
        </div>
    </MenuPopover>
);
