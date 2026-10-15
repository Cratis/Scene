// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { ChooserColumn, moveColumn, readColumns, toggleColumn, visibleColumnIds } from './columnModel';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationIcon } from './FoundationIcon';
import { formatText, readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';

/**
 * The `columnChooser` component: which columns a table shows, and in what order.
 *
 * `columns` lists what could be shown (id, label, whether it starts visible, and whether it is locked - the identifying column is). The
 * chooser is a button that discloses a list of checkboxes; each row also has move up and move down buttons, so ordering needs no
 * drag-and-drop. Its `value` output is the ordered list of visible ids, which the table binds its columns to. Escape closes the list and
 * returns focus to the button.
 */
export function ColumnChooser({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const supplied = useMemo(() => readColumns(element.properties.columns), [element.properties.columns]);
    const suppliedKey = JSON.stringify(supplied);
    const [columns, setColumns] = useState<ChooserColumn[]>(supplied);
    const [open, setOpen] = useState(false);
    const strings = readFoundationStrings(element);
    const state = readComponentState(element, supplied.length > 0);
    const panelId = useId();
    const button = useRef<HTMLButtonElement>(null);

    useEffect(() => setColumns(supplied), [suppliedKey]);
    useValueOutput(bindingOutputs, visibleColumnIds(columns));

    const apply = (next: ChooserColumn[]) => { setColumns(next); interactions?.onChange?.(); };
    const close = (event: KeyboardEvent) => {
        if (event.key !== 'Escape' || !open) return;
        setOpen(false);
        button.current?.focus();
    };

    return (
        <FoundationFrame element={element} interactions={interactions} name='column-chooser' state={state} skeleton={[50]}>
            {state !== ComponentState.Loading && (
                <div className='foundation-popover-host' onKeyDown={close}>
                    <button ref={button} type='button' className='foundation-button' data-emphasis='secondary' aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
                        <FoundationIcon name='columns' />
                        <span>{strings.columnsChoose}</span>
                        <span className='foundation-count'>{formatText(strings.columnsShown, { shown: visibleColumnIds(columns).length, total: columns.length })}</span>
                    </button>
                    <div id={panelId} className='foundation-popover' hidden={!open}>
                        <ul className='foundation-list' aria-label={strings.columnsChoose}>
                            {columns.map((column, index) => (
                                <li key={column.id} className='foundation-list-row'>
                                    <label className='foundation-check'>
                                        <input type='checkbox' checked={column.visible} disabled={column.locked} onChange={() => apply(toggleColumn(columns, index))} />
                                        <span>{column.label}</span>
                                        {column.locked && <span className='foundation-count'>({strings.columnsLocked})</span>}
                                    </label>
                                    <button type='button' className='foundation-icon-button' disabled={index === 0} aria-label={formatText(strings.columnsMoveUp, { name: column.label })} onClick={() => apply(moveColumn(columns, index, -1))}>
                                        <FoundationIcon name='arrow-up' />
                                    </button>
                                    <button type='button' className='foundation-icon-button' disabled={index === columns.length - 1} aria-label={formatText(strings.columnsMoveDown, { name: column.label })} onClick={() => apply(moveColumn(columns, index, 1))}>
                                        <FoundationIcon name='arrow-down' />
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button type='button' className='foundation-link' onClick={() => apply(columns.map(column => ({ ...column, visible: true })))}>{strings.columnsReset}</button>
                    </div>
                </div>
            )}
        </FoundationFrame>
    );
}
