// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ShellDiagnosticCode } from '../shell/ShellDiagnosticCode';
import { ProfileBlockerCode } from './ProfileBlockerCode';

/** One reason the profile cannot be applied, with what the user needs to fix it. */
export interface ProfileBlocker {
    /** What is wrong. */
    code: ProfileBlockerCode;

    /** The package, layout, template or slot that is the problem. */
    subject: string;

    /** A sentence with the real names, ready to show. Never an id or a placeholder. */
    message: string;

    /** For `shellUnusable`: the shell's own code. */
    shellCode?: ShellDiagnosticCode;
}
