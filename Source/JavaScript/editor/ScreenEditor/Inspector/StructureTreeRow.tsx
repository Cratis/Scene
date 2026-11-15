// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DragEvent, KeyboardEvent } from 'react';
import { DropZone } from '../Structure/DropZone';
import { isOperationPermitted } from '../Structure/isOperationPermitted';
import { StructureOperation } from '../Structure/StructureOperation';
import type { StructureRow } from '../Structure/StructureRow';
import type { StructureTreeAdapter } from '../Structure/StructureTreeAdapter';
import { OwnershipBadge } from './OwnershipBadge';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface StructureTreeRowProps<T> {
    row: StructureRow<T>;
    adapter: StructureTreeAdapter<T>;
    strings: ScreenEditorStrings;
    isSelected: boolean;
    isFocusable: boolean;
    dropZone?: DropZone;
    onSelect: (id: string) => void;
    onToggle: (id: string) => void;
    onKeyDown: (event: KeyboardEvent<HTMLLIElement>, id: string) => void;
    onDragStart: (id: string) => void;
    onDragOver: (event: DragEvent<HTMLLIElement>, id: string) => void;
    onDrop: (event: DragEvent<HTMLLIElement>, id: string) => void;
    onDragEnd: () => void;
}

export function StructureTreeRow<T>({ row, adapter, strings, isSelected, isFocusable, dropZone, onSelect, onToggle, onKeyDown, onDragStart, onDragOver, onDrop, onDragEnd }: StructureTreeRowProps<T>) {
    const ownership = adapter.ownershipOf(row.node);
    const canMove = isOperationPermitted(ownership, StructureOperation.Move) && (adapter.isMovable?.(row.node) ?? true);
    const detail = adapter.detailOf?.(row.node);
    const problems = adapter.problemsOf?.(row.node) ?? 0;

    return (
        <li
            role='treeitem'
            aria-level={row.depth + 1}
            aria-selected={isSelected}
            aria-expanded={row.hasChildren ? row.isExpanded : undefined}
            tabIndex={isFocusable ? 0 : -1}
            data-row-id={row.id}
            data-ownership={ownership}
            data-drop-zone={dropZone}
            className='studio-editor-structure-row'
            style={{ paddingInlineStart: `${row.depth * 16 + 8}px` }}
            draggable={canMove}
            onClick={() => onSelect(row.id)}
            onKeyDown={event => onKeyDown(event, row.id)}
            onDragStart={() => onDragStart(row.id)}
            onDragOver={event => onDragOver(event, row.id)}
            onDrop={event => onDrop(event, row.id)}
            onDragEnd={onDragEnd}
        >
            <button
                type='button'
                tabIndex={-1}
                className='studio-editor-structure-row__toggle'
                aria-hidden={!row.hasChildren}
                disabled={!row.hasChildren}
                onClick={event => { event.stopPropagation(); onToggle(row.id); }}
            >
                {row.hasChildren ? (row.isExpanded ? '▾' : '▸') : ''}
            </button>
            <span className='studio-editor-structure-row__name'>{adapter.nameOf(row.node)}</span>
            {detail && <span className='studio-editor-structure-row__detail'>{detail}</span>}
            {problems > 0 && <span className='studio-editor-structure-row__problems' role='img' aria-label={`${problems}`} title={`${problems}`}>⚠ {problems}</span>}
            <OwnershipBadge ownership={ownership} label={strings.ownership[ownership]} />
        </li>
    );
}
