// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Avatar } from '@cratis/components/Display';
import { Button, Menu, MenuItem, MenuTrigger, Popover } from 'react-aria-components';
import { RegisteredComponentProps, SceneThemeProvider, useSceneTheme } from '@cratis/scene.react';
import { readRecords, readString, recordString } from './elementProperties';
import { ShellIcon } from './ShellIcon';
import { useShellLink } from './useShellLink';

/**
 * The signed-in user and their actions. Aria owns popup focus, dismissal and keyboard navigation;
 * Cratis Components has an action menubar, but no popup menu or context-aware menu trigger.
 */
export function UserMenu({ element }: RegisteredComponentProps) {
    const theme = useSceneTheme();
    const name = readString(element, 'name');
    const role = readString(element, 'role');
    const initials = readString(element, 'initials', name.slice(0, 1).toUpperCase());
    const items = readRecords(element, 'items');

    return (
        <div className='layout-user-menu' data-scene-id={element.id}>
            <Avatar label={initials} className='layout-user-avatar' />
            <span className='layout-user-menu-name'>
                <span>{name}</span>
                {role && <span className='layout-user-menu-role'>{role}</span>}
            </span>
            <MenuTrigger>
                <Button className='layout-icon-button' aria-label={`Open the menu for ${name}`}><ShellIcon name='angle-down' /></Button>
                <Popover className='layout-user-popover' placement='bottom end'>
                    <SceneThemeProvider theme={theme} className='layout-overlay-theme'>
                        <Menu className='layout-user-actions' aria-label={`Menu for ${name}`}>
                            {items.map((item, index) => <UserMenuEntry key={`${recordString(item, 'label')}-${index}`} id={`${element.id}-${recordString(item, 'label')}`} label={recordString(item, 'label')} icon={recordString(item, 'icon')} screen={recordString(item, 'targetScreen') || undefined} />)}
                        </Menu>
                    </SceneThemeProvider>
                </Popover>
            </MenuTrigger>
        </div>
    );
}

function UserMenuEntry({ id, label, icon, screen }: { id: string; label: string; icon: string; screen?: string }) {
    const link = useShellLink(screen, { source: 'userMenu', id, label });
    return <MenuItem id={id} textValue={label} href={link.href} onClick={link.onClick} className='layout-user-action' data-nav-problem={screen && link.dead ? 'navTargetMissing' : undefined}>
        {icon && <ShellIcon name={icon} />}
        <span>{label}</span>
    </MenuItem>;
}
