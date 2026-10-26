// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { ActionButton } from './ActionButton';
import { readFoundationStrings } from './foundationStrings';
import { readPermissionRule } from './PermissionRule';

const emphases = ['primary', 'secondary', 'quiet', 'danger'] as const;

/**
 * The `actionButton` component: one action of a screen or a dialog, drawn the way every action of the foundation is.
 *
 * `label` is what it does - a verb, never "OK" - and `emphasis` is `primary`, `secondary`, `quiet` or `danger` (the confirming button of a destructive
 * dialog). It honours the permission rule of spec Part B 1.5 through `permission`: enabled, disabled (shown, refusing, and saying why) or not rendered.
 * Pressing it runs the behaviors attached to the element, which is how a document makes it close a dialog, navigate or execute a command; with
 * `targetScreen` and no behavior it goes to that screen, as the shell's links do.
 */
export function ActionButtonControl({ element, interactions }: RegisteredComponentProps) {
    const strings = readFoundationStrings(element);
    const requested = readOptionalString(element, 'emphasis');
    const emphasis = (emphases as readonly string[]).includes(requested ?? '') ? (requested as typeof emphases[number]) : 'primary';
    const target = readOptionalString(element, 'targetScreen');
    const icon = readOptionalString(element, 'icon');

    return (
        <span className='foundation foundation-action' data-scene-id={element.id}>
            <ActionButton rule={readPermissionRule(element)} emphasis={emphasis} disabledReason={readOptionalString(element, 'disabledReason') ?? strings.disabledNoPermission}
                onClick={event => {
                    if (interactions?.onClick) interactions.onClick(event);
                    else if (target && typeof window !== 'undefined') window.location.hash = `#/${target}`;
                }}>
                {icon && <i className={icon} aria-hidden='true' />}
                {readOptionalString(element, 'label') ?? ''}
            </ActionButton>
        </span>
    );
}
