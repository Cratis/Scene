// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { FoundationIcon } from './FoundationIcon';
import { formatNumber, readLocale, NumberFormat } from './formatting';
import { formatText, readFoundationStrings } from './foundationStrings';

/**
 * The `notificationsButton` component: the bell of the topbar, with the unread count.
 *
 * `count` is the unread number - bind it to a query - and the button says it in words ("3 unread") as well as in the badge, which is hidden from
 * assistive technology so it is not read twice. Pressing it runs the behaviors attached to the element, which open whatever the application shows its
 * notifications in. Counts above 99 read "99+" in the badge and in full in the words.
 */
export function NotificationsButton({ element, interactions }: RegisteredComponentProps) {
    const strings = readFoundationStrings(element);
    const count = typeof element.properties.count === 'number' && element.properties.count > 0 ? Math.floor(element.properties.count) : 0;
    const spoken = count > 0 ? formatText(strings.notificationsCount, { count: formatNumber(count, readLocale(element), NumberFormat.Number, undefined, 0) }) : strings.notificationsNone;

    return (
        <button type='button' className='foundation foundation-notifications' data-scene-id={element.id} onClick={interactions?.onClick}>
            <FoundationIcon name='alert' />
            <span className='foundation-visually-hidden'>{`${strings.notificationsLabel}: ${spoken}`}</span>
            {count > 0 && <span className='foundation-notifications-badge' aria-hidden='true'>{count > 99 ? '99+' : count}</span>}
        </button>
    );
}
