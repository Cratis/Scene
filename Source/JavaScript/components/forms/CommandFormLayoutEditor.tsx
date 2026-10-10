// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { KeyboardEvent, useState } from 'react';
import { CommandFormLayout, SceneEditKind } from '@cratis/scene.model';
import { CommandFormLayoutKey, applyCommandFormLayoutKey } from '@cratis/scene.engine';
import { DesignTimePropertyEditorProps } from '@cratis/scene.react';
import { commandFormLayout } from './commandFormLayout';

const layoutKeys = new Set<string>(Object.values(CommandFormLayoutKey));

/**
 * Arranges a command form's fields from the keyboard. Each placed field is a focusable cell: the arrow keys
 * move it one cell, and Shift with an arrow key resizes it. A valid change is submitted as one canonical
 * edit of the `layout` property; an invalid one is announced and the committed layout is kept.
 */
export function CommandFormLayoutEditor({ context, property, value, setValue }: DesignTimePropertyEditorProps) {
    const layout = commandFormLayout({ layout: value });
    const [problem, setProblem] = useState<string>();
    if (!layout) return <p role='note'>{property.label}: no layout is authored yet.</p>;

    const onKeyDown = (field: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
        if (!layoutKeys.has(event.key)) return;
        event.preventDefault();
        const draft = applyCommandFormLayoutKey(layout, field, event.key as CommandFormLayoutKey, event.shiftKey, layout.placements.map(placement => placement.field));
        if (!draft) return;
        if (!draft.isValid) {
            setProblem(draft.diagnostics[0].message);
            return;
        }

        setProblem(undefined);
        commit(draft.draft);
    };

    const commit = (next: CommandFormLayout) => {
        setValue(next);
        context.submitEdits([{ kind: SceneEditKind.SetProperty, nodeId: context.element.id, path: property.path, value: next }]);
    };

    return <div role='group' aria-label={property.label} aria-describedby={`${context.element.id}-layout-help`}>
        <p id={`${context.element.id}-layout-help`}>Arrow keys move a field. Shift and an arrow key resize it.</p>
        {layout.placements.map(placement => <button key={placement.field} type='button' onKeyDown={onKeyDown(placement.field)}
            aria-label={`${placement.field}: row ${placement.row}, column ${placement.column}, spans ${placement.columnSpan ?? 1} column(s) and ${placement.rowSpan ?? 1} row(s)`}>
            {placement.field}
        </button>)}
        {problem && <p role='alert'>{problem}</p>}
    </div>;
}
