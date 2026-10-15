// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One validation problem an invocation reports, to be shown inline in the dialog that submitted it.
 */
export interface InvocationValidationError {
    /** The command property the problem belongs to; absent for a problem with the command as a whole. */
    field?: string;

    /** What is wrong. */
    message: string;
}
