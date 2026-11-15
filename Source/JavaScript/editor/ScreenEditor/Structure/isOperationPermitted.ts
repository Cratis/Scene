// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Ownership } from './Ownership';
import { StructureOperation } from './StructureOperation';

// The ownership policy in one place. Local content allows everything; inherited content can be selected for
// inspection; inherited content that exposes settings can additionally be configured. Moving, deleting,
// restyling or restructuring inherited content stays blocked in every case.
export function isOperationPermitted(ownership: Ownership, operation: StructureOperation): boolean {
    switch (ownership) {
        case Ownership.Local:
            return true;
        case Ownership.ConfigurableInherited:
            return operation === StructureOperation.Select || operation === StructureOperation.Configure;
        case Ownership.Inherited:
            return operation === StructureOperation.Select;
    }
}
