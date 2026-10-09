// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationDiagnosticCode } from './NavigationDiagnosticCode';

/**
 * One problem with how destinations, outlets and routes fit together.
 */
export interface NavigationDiagnostic {
    /** What kind of problem this is. */
    code: NavigationDiagnosticCode;

    /** A sentence naming the destinations, outlets or screens involved. */
    message: string;

    /** The entry the problem was found on - its `id`, or `#<position>` when it has none. Absent for model-wide problems. */
    entry?: string;
}
