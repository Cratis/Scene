// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InvocationValidationError } from './InvocationValidationError';

/**
 * What invoking a state change slice came back with.
 */
export interface InvocationResult {
    /** Whether the slice accepted the command. A dialog closes on success and shows the problems otherwise. */
    succeeded: boolean;

    /** The validation problems, shown against their fields; a problem without a field is shown for the whole form. */
    validationErrors?: InvocationValidationError[];

    /** A message for the user - a failure the server reports, or the note of a dry run. */
    message?: string;

    /** The command payload that was, or with a dry run would have been, sent. */
    payload?: Record<string, unknown>;

    /** Whether nothing was sent: the invocation was a dry run. */
    dryRun?: boolean;

    /** Whatever the invoker returns for the caller, for example the result of the command. */
    value?: unknown;
}
