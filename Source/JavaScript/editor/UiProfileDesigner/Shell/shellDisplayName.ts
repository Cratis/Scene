// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { EffectiveShell } from '@cratis/scene.engine';

/** What the shell is called to the author: the name they gave the template, or the template's name for a blueprint's (an own template's name is its identifier). */
export const shellDisplayName = (shell: EffectiveShell): string => (shell.template as { displayName?: string }).displayName ?? shell.name;
