// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout } from '@cratis/scene.model';
import { CommandFormLayoutDraft } from './CommandFormLayoutDraft';

/**
 * Commits a draft layout only when it is valid; otherwise returns the previous committed metadata.
 */
export function commitCommandFormLayoutDraft(draft: CommandFormLayoutDraft): CommandFormLayout {
    return draft.isValid ? draft.draft : draft.committed;
}
