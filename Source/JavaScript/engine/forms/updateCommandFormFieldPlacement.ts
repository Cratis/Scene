// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout, FormFieldPlacement } from '@cratis/scene.model';
import { CommandFormLayoutDraft } from './CommandFormLayoutDraft';
import { validateCommandFormLayout } from './validateCommandFormLayout';

/**
 * Updates a field placement as draft geometry, keeping the committed layout separate when invalid.
 */
export function updateCommandFormFieldPlacement(
    committed: CommandFormLayout,
    placement: FormFieldPlacement,
    fields: readonly string[] = [],
): CommandFormLayoutDraft {
    const draft: CommandFormLayout = {
        ...committed,
        placements: [...committed.placements.filter(existing => existing.field !== placement.field), placement],
    };
    const diagnostics = validateCommandFormLayout(draft, fields);
    return { committed, draft, diagnostics, isValid: diagnostics.length === 0 };
}
