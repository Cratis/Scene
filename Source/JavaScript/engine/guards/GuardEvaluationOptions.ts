// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Options for enforcing Screenplay's operand domain during guard evaluation. */
export interface GuardEvaluationOptions {
    /**
     * Requires string operands for Contains; null or absent fields evaluate to false.
     * Other non-string operands are unevaluable.
     * Absent or false preserves the generic guard semantics.
     */
    strictOperands?: boolean;
}
