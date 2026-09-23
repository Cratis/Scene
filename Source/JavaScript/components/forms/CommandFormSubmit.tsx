// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useCommandFormContext } from '@cratis/arc.react/commands';

interface CommandFormSubmitProps {
    label: string;
}

/** Internal footer child; only rendered under the native form's context. */
export function CommandFormSubmit({ label }: CommandFormSubmitProps) {
    const { isExecuting, isAuthorized } = useCommandFormContext();
    // Do not gate on isValid: submitting untouched invalid fields must reveal native validation.
    // No click handler: the containing Arc form owns submission, validation and execution.
    return <button type='submit' disabled={isExecuting || !isAuthorized} aria-busy={isExecuting}>{label}</button>;
}
