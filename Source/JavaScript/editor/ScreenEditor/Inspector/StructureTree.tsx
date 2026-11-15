// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCallback, useMemo, useState, type DragEvent, type KeyboardEvent } from 'react';
import { isDeleteKey } from '../Structure/isDeleteKey';
import { isRemovable, selectionAfterRemoval } from '../Structure/removal';
import { DropZone } from '../Structure/DropZone';
import { flattenStructure } from '../Structure/flattenStructure';
import { MoveIntent } from '../Structure/MoveIntent';
import { resolveMoveIntentEdit } from '../Structure/resolveMoveIntentEdit';
import { resolveTreeDrop } from '../Structure/resolveTreeDrop';
import type { StructureEdit } from '../Structure/StructureEdit';
import type { StructureEditRejection } from '../Structure/StructureEditRejection';
import type { StructureTreeAdapter } from '../Structure/StructureTreeAdapter';
import { pointerDropZone } from './pointerDropZone';
import type { ScreenEditorStrings } from './ScreenEditorStrings';
import { StructureTreeRow } from './StructureTreeRow';
import './StructureTree.css';

export interface StructureTreeProps<T> {
    roots: T[];
    adapter: StructureTreeAdapter<T>;
    strings: ScreenEditorStrings;
    selectedId?: string;
    onSelect: (id: string) => void;

    // Applies a move. Returns why it was refused, or undefined once it was applied.
    onEdit: (edit: StructureEdit) => StructureEditRejection | undefined;

    // Removes a node when Delete or Backspace is pressed on its row. Without it the keys do nothing here.
    onRemove?: (id: string) => void;
}

const moveIntentByKey: Record<string, MoveIntent> = {
    ArrowUp: MoveIntent.MoveUp,
    ArrowDown: MoveIntent.MoveDown,
    ArrowLeft: MoveIntent.Outdent,
    ArrowRight: MoveIntent.Indent,
};

// The Structure tab: the screen's composition as a tree. Select, reorder and reparent by pointer, or from the keyboard
// with Alt and the arrow keys - both go through the same validation, so a locked node or an invalid target is refused
// the same way however the request arrives, and the refusal is announced.
export function StructureTree<T>({ roots, adapter, strings, selectedId, onSelect, onEdit, onRemove }: StructureTreeProps<T>) {
    // The top two levels start open: the first level is usually just the screen's own root, and an author wants to see what is in it.
    const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(() => new Set(roots.flatMap(root => [adapter.idOf(root), ...adapter.childrenOf(root).map(child => adapter.idOf(child))])));
    const [focusedId, setFocusedId] = useState<string | undefined>(selectedId);
    const [draggedId, setDraggedId] = useState<string>();
    const [hover, setHover] = useState<{ id: string; zone: DropZone }>();
    const [announcement, setAnnouncement] = useState('');

    const rows = useMemo(() => flattenStructure(roots, expandedIds, adapter), [roots, expandedIds, adapter]);
    const tabStopId = rows.some(row => row.id === focusedId) ? focusedId : rows[0]?.id;

    const toggle = useCallback((id: string) => setExpandedIds(previous => {
        const next = new Set(previous);
        if (!next.delete(id)) next.add(id);
        return next;
    }), []);

    const edit = useCallback((request: StructureEdit | undefined) => {
        if (!request) return;
        const rejection = onEdit(request);
        setAnnouncement(rejection ? strings.rejection[rejection] : strings.moved);
        if (!rejection && request.targetParentId) setExpandedIds(previous => new Set(previous).add(request.targetParentId!));
    }, [onEdit, strings]);

    const focusRow = (id: string | undefined) => {
        if (!id) return;
        setFocusedId(id);
        requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(id)}"]`)?.focus());
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>, id: string) => {
        const index = rows.findIndex(row => row.id === id);
        const row = rows[index];

        if (event.altKey && moveIntentByKey[event.key]) {
            event.preventDefault();
            edit(resolveMoveIntentEdit(roots, id, moveIntentByKey[event.key], adapter));
            focusRow(id);
            return;
        }

        if (isDeleteKey(event) && onRemove && isRemovable(roots, id, adapter)) {
            event.preventDefault();
            const next = selectionAfterRemoval(roots, id, adapter);
            onRemove(id);
            focusRow(next);
            return;
        }

        switch (event.key) {
            case 'ArrowDown': event.preventDefault(); focusRow(rows[index + 1]?.id); break;
            case 'ArrowUp': event.preventDefault(); focusRow(rows[index - 1]?.id); break;
            case 'Home': event.preventDefault(); focusRow(rows[0]?.id); break;
            case 'End': event.preventDefault(); focusRow(rows[rows.length - 1]?.id); break;
            case 'ArrowRight':
                event.preventDefault();
                if (row.hasChildren && !row.isExpanded) toggle(id); else focusRow(rows[index + 1]?.parentId === id ? rows[index + 1].id : undefined);
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (row.isExpanded) toggle(id); else focusRow(row.parentId ?? undefined);
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                onSelect(id);
                break;
        }
    };

    const handleDragOver = (event: DragEvent<HTMLLIElement>, id: string) => {
        if (!draggedId) return;
        event.preventDefault();
        const bounds = event.currentTarget.getBoundingClientRect();
        const target = rows.find(row => row.id === id);
        setHover({ id, zone: pointerDropZone(event.clientY - bounds.top, bounds.height, !!target && adapter.acceptsChildren(target.node)) });
    };

    const handleDrop = (event: DragEvent<HTMLLIElement>, id: string) => {
        event.preventDefault();
        if (draggedId && hover?.id === id) edit(resolveTreeDrop(roots, draggedId, id, hover.zone, adapter));
        setDraggedId(undefined);
        setHover(undefined);
    };

    if (rows.length === 0) return <p className='studio-editor-structure-empty'>{strings.structureEmpty}</p>;

    return (
        <>
            <ul role='tree' aria-label={strings.structureLabel} className='studio-editor-structure-tree'>
                {rows.map(row => (
                    <StructureTreeRow
                        key={row.id}
                        row={row}
                        adapter={adapter}
                        strings={strings}
                        isSelected={row.id === selectedId}
                        isFocusable={row.id === tabStopId}
                        dropZone={hover?.id === row.id ? hover.zone : undefined}
                        onSelect={id => { setFocusedId(id); onSelect(id); }}
                        onToggle={toggle}
                        onKeyDown={handleKeyDown}
                        onDragStart={setDraggedId}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onDragEnd={() => { setDraggedId(undefined); setHover(undefined); }}
                    />
                ))}
            </ul>
            <p className='studio-editor-structure-announcement' role='status' aria-live='polite'>{announcement}</p>
        </>
    );
}
