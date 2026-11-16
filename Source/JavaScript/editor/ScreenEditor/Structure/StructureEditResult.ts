// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StructureEditRejection } from './StructureEditRejection';

export interface AcceptedStructureEdit<T> {
    accepted: true;
    roots: T[];
}

export interface RejectedStructureEdit {
    accepted: false;
    reason: StructureEditRejection;
}

export type StructureEditResult<T> = AcceptedStructureEdit<T> | RejectedStructureEdit;
