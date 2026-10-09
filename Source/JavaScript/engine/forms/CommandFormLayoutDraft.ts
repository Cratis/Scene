// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CommandFormLayout } from '@cratis/scene.model';
import { CommandFormLayoutDiagnostic } from './CommandFormLayoutDiagnostic';

/**
 * Separates invalid editing state from the last committed form geometry.
 */
export interface CommandFormLayoutDraft {
    committed: CommandFormLayout;
    draft: CommandFormLayout;
    diagnostics: CommandFormLayoutDiagnostic[];
    isValid: boolean;
}
