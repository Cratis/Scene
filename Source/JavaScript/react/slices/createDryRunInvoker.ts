// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InvocationValidationError } from './InvocationValidationError';
import { SliceInvoker } from './SliceInvoker';

/** What a dry run is told about each invocation. */
export interface DryRunInvocation {
    /** The qualified id of the slice. */
    sliceId: string;

    /** The command the slice accepts, when known. */
    command?: string;

    /** The payload that would have been sent. */
    payload: Record<string, unknown>;
}

export interface DryRunInvokerOptions {
    /** Called for every invocation that passes validation, with the would-be payload - the Studio preview shows it as a toast. */
    onInvoked?(invocation: DryRunInvocation): void;

    /** Extra validation of the payload; the problems it returns are reported like the real ones and nothing is invoked. */
    validate?(invocation: DryRunInvocation): InvocationValidationError[];
}

/**
 * An invoker that sends nothing (PRV5): it validates, reports what it would have sent and succeeds, so a preview can walk a
 * toolbar button through its dialog without touching a backend.
 */
export function createDryRunInvoker(options: DryRunInvokerOptions = {}): SliceInvoker & { readonly dryRun: true } {
    return {
        dryRun: true,
        async invoke(sliceId, payload, command) {
            const invocation: DryRunInvocation = { sliceId, payload, ...(command === undefined ? {} : { command }) };
            const validationErrors = options.validate?.(invocation) ?? [];
            if (validationErrors.length > 0) return { succeeded: false, validationErrors, payload, dryRun: true };

            options.onInvoked?.(invocation);
            return { succeeded: true, payload, dryRun: true, message: `Dry run: ${command ?? sliceId} was not sent.` };
        },
    };
}
