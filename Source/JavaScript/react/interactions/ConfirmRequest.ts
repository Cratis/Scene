// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A question an interaction is waiting on the answer to.
 *
 * The sequence that asked is suspended until {@link answer} is called, which is the whole point of a confirm:
 * everything after it in the document runs only if the answer was yes.
 */
export interface ConfirmRequest {
    /** What the document asked, already resolved against the interaction's context. */
    readonly message: string;

    /**
     * Answers the question and lets the suspended sequence continue.
     * @param confirmed Whether the user agreed.
     */
    answer(confirmed: boolean): void;
}
