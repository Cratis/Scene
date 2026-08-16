// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useRef } from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Menu as PrimeMenu } from 'primereact/menu';
import { MenuItem as PrimeMenuItem } from 'primereact/menuitem';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { readRecords, readString, recordString } from './elementProperties';

/**
 * The signed-in user's avatar and menu.
 *
 * The popup is PrimeReact's `Menu` rather than hand-written markup: an overlay that positions itself,
 * traps focus and closes on escape is framework behavior, and re-implementing it in a layout package is
 * how a shell ends up with its own subtly broken menu. The shell hand-writes CSS only where PrimeReact 10
 * has no primitive at all - the app-shell modes - and uses the library everywhere else.
 */
export function UserMenu({ element }: RegisteredComponentProps) {
    const menu = useRef<PrimeMenu>(null);
    const name = readString(element, 'name');
    const role = readString(element, 'role');
    const initials = readString(element, 'initials', name.slice(0, 1).toUpperCase());
    const items = readRecords(element, 'items').map(
        (item): PrimeMenuItem => ({
            label: recordString(item, 'label'),
            icon: recordString(item, 'icon') || undefined,
            url: recordString(item, 'targetScreen') ? `#/${recordString(item, 'targetScreen')}` : undefined,
        }),
    );

    return (
        <div className='layout-user-menu' data-scene-id={element.id}>
            <Avatar label={initials} shape='circle' />
            <span className='layout-user-menu-name'>
                <span>{name}</span>
                {role && <span className='layout-user-menu-role'>{role}</span>}
            </span>
            <PrimeMenu ref={menu} model={items} popup id={`${element.id}-menu`} />
            <Button
                type='button'
                text
                rounded
                icon='pi pi-angle-down'
                aria-label={`Open the menu for ${name}`}
                aria-controls={`${element.id}-menu`}
                aria-haspopup
                onClick={event => menu.current?.toggle(event)}
            />
        </div>
    );
}
