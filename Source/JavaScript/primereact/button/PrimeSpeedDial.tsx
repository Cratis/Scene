// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SpeedDial } from 'primereact/speeddial';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';
import { menuItemsProperty } from '../menuItems';

/**
 * The `PrimeReact:speedDial` component - a floating action button that fans its actions out on hover.
 *
 * Rendered inside a sized, relatively positioned box because SpeedDial positions its actions absolutely
 * against its nearest positioned ancestor; dropped straight into a Scene tree it would otherwise anchor
 * itself to the page and float over unrelated content.
 *
 * PrimeReact 11 replaced the `model` prop with parts, so the items are written out here. That is more
 * lines but a better fit: each action is a real button the adapter can name and label, where v10's model
 * entries produced icon-only buttons with no accessible name unless the screen happened to think of one.
 * The label is used as the accessible name and as the tooltip, and the icon is marked decorative, so an
 * action reads the same to a screen reader as it does to a pointer.
 */
export function PrimeSpeedDial({ element }: RegisteredComponentProps) {
    const items = menuItemsProperty(element, 'items');
    return (
        <div data-scene-id={element.id} className='relative h-40 w-40'>
            <SpeedDial.Root
                direction={stringProperty(element, 'direction', 'up') as 'up' | 'down' | 'left' | 'right'}
                type={stringProperty(element, 'type', 'linear') as 'linear' | 'circle' | 'semi-circle' | 'quarter-circle'}>
                <SpeedDial.Trigger aria-label='Actions'>
                    <i className='pi pi-plus' aria-hidden='true' />
                </SpeedDial.Trigger>
                <SpeedDial.List>
                    {items.map((item, index) => (
                        <SpeedDial.Item key={index} index={index}>
                            <SpeedDial.Action aria-label={item.label} title={item.label} onClick={item.command}>
                                <i className={item.icon ?? 'pi pi-circle'} aria-hidden='true' />
                            </SpeedDial.Action>
                        </SpeedDial.Item>
                    ))}
                </SpeedDial.List>
            </SpeedDial.Root>
        </div>
    );
}
