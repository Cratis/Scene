// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormWidth } from '@cratis/scene.model';
import { CommandFormLayoutDraft } from './CommandFormLayoutDraft';
import { validateCommandFormLayout } from './validateCommandFormLayout';

/**
 * Resizes a column as draft geometry, keeping the last committed layout separate when invalid.
 */
export function resizeCommandFormColumn(
    committed: CommandFormLayout,
    columnIndex: number,
    width: FormWidth,
    fields: readonly string[] = [],
): CommandFormLayoutDraft {
    const draft: CommandFormLayout = {
        ...committed,
        columns: committed.columns.map(column => column.index === columnIndex ? { ...column, width } : column),
    };
    const diagnostics = validateCommandFormLayout(draft, fields);
    return { committed, draft, diagnostics, isValid: diagnostics.length === 0 };
}
