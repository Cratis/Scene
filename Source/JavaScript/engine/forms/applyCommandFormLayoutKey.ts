// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormFieldPlacement } from '@cratis/scene.model';
import { CommandFormLayoutDraft } from './CommandFormLayoutDraft';
import { CommandFormLayoutKey } from './CommandFormLayoutKey';
import { updateCommandFormFieldPlacement } from './updateCommandFormFieldPlacement';

/**
 * Moves or resizes one field from the keyboard, so the layout can be arranged without a pointer.
 *
 * An arrow key moves the field one cell; with `resize`, Left and Right narrow and widen its column span and
 * Up and Down shorten and lengthen its row span. Positions are one-based and never go below one, and spans never below one.
 * The result is a draft validated like any other placement change, so a move or resize past the last
 * column is reported in its diagnostics and the committed layout is kept. Returns undefined for a field that is not placed.
 */
export function applyCommandFormLayoutKey(
    committed: CommandFormLayout,
    field: string,
    key: CommandFormLayoutKey,
    resize = false,
    fields: readonly string[] = [],
): CommandFormLayoutDraft | undefined {
    const placement = committed.placements.find(candidate => candidate.field === field);
    if (!placement) return undefined;
    return updateCommandFormFieldPlacement(committed, resize ? resized(placement, key) : moved(placement, key), fields);
}

function moved(placement: FormFieldPlacement, key: CommandFormLayoutKey): FormFieldPlacement {
    switch (key) {
        case CommandFormLayoutKey.ArrowLeft: return { ...placement, column: Math.max(1, placement.column - 1) };
        case CommandFormLayoutKey.ArrowRight: return { ...placement, column: placement.column + 1 };
        case CommandFormLayoutKey.ArrowUp: return { ...placement, row: Math.max(1, placement.row - 1) };
        case CommandFormLayoutKey.ArrowDown: return { ...placement, row: placement.row + 1 };
    }
}

function resized(placement: FormFieldPlacement, key: CommandFormLayoutKey): FormFieldPlacement {
    const columnSpan = placement.columnSpan ?? 1;
    const rowSpan = placement.rowSpan ?? 1;
    switch (key) {
        case CommandFormLayoutKey.ArrowLeft: return { ...placement, columnSpan: Math.max(1, columnSpan - 1) };
        case CommandFormLayoutKey.ArrowRight: return { ...placement, columnSpan: columnSpan + 1 };
        case CommandFormLayoutKey.ArrowUp: return { ...placement, rowSpan: Math.max(1, rowSpan - 1) };
        case CommandFormLayoutKey.ArrowDown: return { ...placement, rowSpan: rowSpan + 1 };
    }
}
