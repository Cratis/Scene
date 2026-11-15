// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { CommandFormColumn } from './CommandFormColumn';
import type { CommandFormInput } from './CommandFormInput';
import { CommandFormMode } from './CommandFormMode';

export interface CommandFormConfiguration {
    command: string;
    mode: CommandFormMode;
    inputs: CommandFormInput[];
    columns?: CommandFormColumn[];
}
