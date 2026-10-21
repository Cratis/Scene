// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Breadcrumb as AriaBreadcrumb, Breadcrumbs } from 'react-aria-components';
import { RegisteredComponentProps, useOptionalSceneNavigation, useSceneNavigationModel } from '@cratis/scene.react';
import { locationTrail } from './locationTrail';
import { readBoolean, readOptionalString, readRecords, recordString } from './elementProperties';
import { ShellIcon } from './ShellIcon';
import { useShellLink } from './useShellLink';

/**
 * The authored trail, or the navigation model's location when `followLocation` permits it.
 * Cratis Breadcrumbs exposes a destination callback without the activation event. These Aria items
 * retain native links so the host's Alt-select policy and modified/new-tab clicks keep working.
 */
export function Breadcrumb({ element }: RegisteredComponentProps) {
    const home = readOptionalString(element, 'homeTargetScreen');
    const navigation = useOptionalSceneNavigation();
    const model = useSceneNavigationModel();
    const authored = readRecords(element, 'items');
    const derive = authored.length === 0 && readBoolean(element, 'followLocation', true) && navigation !== undefined && model !== undefined;
    const trail = derive
        ? locationTrail(model, navigation.primaryScreen).map(crumb => ({ label: crumb.label, screen: crumb.targetScreen }))
        : authored.map(item => ({ label: recordString(item, 'label'), screen: recordString(item, 'targetScreen') || undefined }));

    return (
        <nav aria-label='Breadcrumb' data-scene-id={element.id}>
            <Breadcrumbs className='layout-breadcrumb-list'>
                {home && <AriaBreadcrumb className='layout-breadcrumb-item'>
                    <Crumb id={`${element.id}-home`} screen={home} label='Home' isHome />
                    {trail.length > 0 && <ShellIcon name='chevron-right' />}
                </AriaBreadcrumb>}
                {trail.map((entry, index) => (
                    <AriaBreadcrumb key={`${index}-${entry.label}`} className='layout-breadcrumb-item'>
                        {entry.screen
                            ? <Crumb id={`${element.id}-${index}`} screen={entry.screen} label={entry.label} />
                            : <span aria-current='page'>{entry.label}</span>}
                        {index < trail.length - 1 && <ShellIcon name='chevron-right' />}
                    </AriaBreadcrumb>
                ))}
            </Breadcrumbs>
        </nav>
    );
}

function Crumb({ id, screen, label, isHome = false }: { id: string; screen: string; label: string; isHome?: boolean }) {
    const link = useShellLink(screen, { source: 'breadcrumb', id, label });
    return <a href={link.href ?? `#/${screen}`} aria-label={isHome ? 'Home' : undefined} onClick={link.onClick} data-nav-problem={link.dead ? 'navTargetMissing' : undefined}>
        {isHome ? <ShellIcon name='home' /> : label}
    </a>;
}
