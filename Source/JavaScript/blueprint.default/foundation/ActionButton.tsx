// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { PermissionRule } from './PermissionRule';

export interface ActionButtonProps {
    /** The permission rule that decides whether the control works, refuses or is not rendered. */
    rule?: PermissionRule;

    /** Why the control is disabled, announced and shown as its tooltip. */
    disabledReason: string;

    /** What the control does when pressed. */
    onClick?: (event: { stopPropagation(): void }) => void;

    /** The emphasis of the button. */
    emphasis?: 'primary' | 'secondary' | 'quiet';

    children: ReactNode;
}

/**
 * The one button every foundation component starts an action with, so the permission rule of spec Part B 1.5 is honoured in one place:
 * hidden renders nothing; disabled stays focusable-by-description (`aria-disabled`) and carries the reason, rather than a bare
 * greyed control nobody can explain.
 */
export function ActionButton({ rule = PermissionRule.Enabled, disabledReason, onClick, emphasis = 'primary', children }: ActionButtonProps) {
    if (rule === PermissionRule.Hidden) return undefined;

    const disabled = rule === PermissionRule.Disabled;
    return (
        <button type='button' className='foundation-button' data-emphasis={emphasis} aria-disabled={disabled || undefined}
            title={disabled ? disabledReason : undefined} onClick={disabled ? undefined : onClick}>
            {children}
            {disabled && <span className='foundation-visually-hidden'>{`. ${disabledReason}`}</span>}
        </button>
    );
}
