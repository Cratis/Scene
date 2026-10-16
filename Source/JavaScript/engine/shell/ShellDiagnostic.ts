// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellDiagnosticCode } from './ShellDiagnosticCode';

/** One problem found while resolving the effective shell or checking the profile around it. */
export interface ShellDiagnostic {
    /** The engine-owned code. */
    code: ShellDiagnosticCode;

    /** The human message. It carries real names (templates, screens, outlets, packages), never ids. */
    message: string;

    /** The thing the problem is about (a template, screen, theme or package name), when there is one. */
    subject?: string;
}
