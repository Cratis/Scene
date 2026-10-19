// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { FoundationIcon, isFoundationIcon } from './FoundationIcon';
import { formatNumber, readLocale, NumberFormat } from './formatting';
import { formatText, readFoundationStrings } from './foundationStrings';

/**
 * The `indicatorButton` component: an icon button with a live count - the basket of a shop's topbar, a message tray.
 *
 * `count` is the number - bind it to a query result - and the button says it in words ("Basket: 3") as well as in the badge, which is hidden from
 * assistive technology so it is not read twice. Nothing is drawn in the badge while the count is zero, and counts above 99 read "99+" in the
 * badge and in full in the words. Pressing it runs the behaviors attached to the element, which open whatever the application shows the
 * things counted in (a navigation to the basket).
 */
export function IndicatorButton({ element, interactions }: RegisteredComponentProps) {
    const strings = readFoundationStrings(element);
    const count = typeof element.properties.count === 'number' && element.properties.count > 0 ? Math.floor(element.properties.count) : 0;
    const label = typeof element.properties.label === 'string' && element.properties.label.length > 0 ? element.properties.label : 'Items';
    const icon = typeof element.properties.icon === 'string' && isFoundationIcon(element.properties.icon) ? element.properties.icon : 'cart';
    const spoken = count > 0
        ? formatText(strings.indicatorCount, { label, count: formatNumber(count, readLocale(element), NumberFormat.Number, undefined, 0) })
        : formatText(strings.indicatorNone, { label });

    return (
        <button type='button' className='foundation foundation-notifications foundation-indicator' data-scene-id={element.id} data-count={count} onClick={interactions?.onClick}>
            <FoundationIcon name={icon} />
            <span className='foundation-visually-hidden'>{spoken}</span>
            {count > 0 && <span className='foundation-notifications-badge' aria-hidden='true'>{count > 99 ? '99+' : count}</span>}
        </button>
    );
}
