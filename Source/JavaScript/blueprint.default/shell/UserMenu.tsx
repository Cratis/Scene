// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Menu as PrimeMenu } from 'primereact/menu';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { MenuEntry } from './MenuEntry';
import { readRecords, readString, recordString } from './elementProperties';

/**
 * The signed-in user's avatar and menu.
 *
 * The popup is PrimeReact's `Menu` rather than hand-written markup: an overlay that positions itself,
 * traps focus and closes on escape is framework behavior, and re-implementing it in a layout package is
 * how a shell ends up with its own subtly broken menu. The shell hand-writes CSS only where PrimeReact
 * has no primitive at all - the app-shell modes - and uses the library everywhere else.
 *
 * PrimeReact 11 replaced the `model` array with composition, so the entries are rendered here rather than
 * handed over as data - and `primereact/menuitem`, the type that array was made of, went with it, which is
 * why they are mapped into this package's own {@link MenuEntry}. The trade is worth taking: `Menu.Trigger`
 * now owns opening the popup and reporting `aria-haspopup`/`aria-expanded` for it, so the ref, the toggle
 * handler and the hand-maintained aria that used to sit here - and could drift out of step with the popup
 * they described - are gone.
 */
export function UserMenu({ element }: RegisteredComponentProps) {
    const name = readString(element, 'name');
    const role = readString(element, 'role');
    const initials = readString(element, 'initials', name.slice(0, 1).toUpperCase());
    const items = readRecords(element, 'items').map(
        (item): MenuEntry => ({
            label: recordString(item, 'label'),
            icon: recordString(item, 'icon') || undefined,
            url: recordString(item, 'targetScreen') ? `#/${recordString(item, 'targetScreen')}` : undefined,
        }),
    );

    return (
        <div className='layout-user-menu' data-scene-id={element.id}>
            <Avatar.Root shape='circle'>
                <Avatar.Fallback>{initials}</Avatar.Fallback>
            </Avatar.Root>
            <span className='layout-user-menu-name'>
                <span>{name}</span>
                {role && <span className='layout-user-menu-role'>{role}</span>}
            </span>
            <PrimeMenu.Root>
                <PrimeMenu.Trigger as={Button} variant='text' rounded iconOnly aria-label={`Open the menu for ${name}`}>
                    <i className='pi pi-angle-down' aria-hidden='true' />
                </PrimeMenu.Trigger>
                <PrimeMenu.Portal>
                    <PrimeMenu.Positioner>
                        <PrimeMenu.Popup>
                            <PrimeMenu.List>
                                {items.map(item => (
                                    <PrimeMenu.Item key={item.label} as='a' href={item.url}>
                                        {item.icon && <i className={item.icon} aria-hidden='true' />}
                                        <span>{item.label}</span>
                                    </PrimeMenu.Item>
                                ))}
                            </PrimeMenu.List>
                        </PrimeMenu.Popup>
                    </PrimeMenu.Positioner>
                </PrimeMenu.Portal>
            </PrimeMenu.Root>
        </div>
    );
}
