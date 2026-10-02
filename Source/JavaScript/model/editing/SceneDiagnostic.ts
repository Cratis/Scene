// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DiagnosticCode } from './DiagnosticCode';
import { DiagnosticSeverity } from './DiagnosticSeverity';

/**
 * One finding from inspecting, editing, validating or resolving. Plain data, so a host can show it, persist it or
 * ship it to another process.
 */
export interface SceneDiagnostic {
    code: `${DiagnosticCode}`;
    severity: `${DiagnosticSeverity}`;
    message: string;

    /** The node the finding is about, when there is one. */
    nodeId?: string;

    /** The instance the finding is about. */
    instance?: string;

    /** The id of the component the finding is about. */
    component?: string;

    /** The property path the finding is about. */
    path?: string;

    /** The collection item the finding is about. */
    itemId?: string;
}

export const SceneDiagnosticPropertyNames: (keyof SceneDiagnostic)[] = [
    'code', 'severity', 'message', 'nodeId', 'instance', 'component', 'path', 'itemId',
];
