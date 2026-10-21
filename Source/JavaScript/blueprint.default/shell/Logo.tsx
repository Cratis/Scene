// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { useSceneTheme } from '@cratis/scene.react';
import { ProfileRegion } from '@cratis/scene.engine';
import { readBoolean, readOptionalString, readString } from './elementProperties';
import { ShellIcon } from './ShellIcon';
import { useShellLink } from './useShellLink';

/** The shell icon of each logo the profile can choose. */
const logoIconClass: Record<string, string> = {
    box: 'pi-box', layers: 'pi-clone', home: 'pi-home', users: 'pi-users', receipt: 'pi-receipt', package: 'pi-gift', database: 'pi-database', palette: 'pi-palette',
};

/**
 * The brand mark.
 *
 * This is the one place in the shell that reads the active theme directly rather than through a token,
 * because picking between a light-background and a dark-background logo asset is a decision no CSS custom
 * property can express - the two are different files. `useSceneTheme` exists for exactly this case.
 */
export function Logo({ element }: RegisteredComponentProps) {
    const theme = useSceneTheme();
    const label = readString(element, 'label', 'Cratis');
    const initials = readString(element, 'initials', label.slice(0, 1).toUpperCase());
    const lightSource = readOptionalString(element, 'lightImageUrl');
    const darkSource = readOptionalString(element, 'darkImageUrl');
    const source = theme?.isDark ? darkSource ?? lightSource : lightSource ?? darkSource;
    const iconName = readOptionalString(element, 'iconName');
    const showName = readBoolean(element, 'showName', true);
    const targetScreen = readString(element, 'targetScreen', 'Dashboard');
    const link = useShellLink(targetScreen === '' ? undefined : targetScreen, { source: 'logo', id: element.id, label });

    return (
        <a className='layout-logo' href={link.href ?? `#/${targetScreen}`} onClick={link.onClick} data-scene-id={element.id} data-scene-region={ProfileRegion.Identity} aria-label={showName ? undefined : label}>
            {source ? <img src={source} alt={label} height={28} />
                : iconName ? <span className='layout-logo-mark'><ShellIcon name={logoIconClass[iconName] ?? 'pi-box'} /></span>
                    : <span className='layout-logo-mark'>{initials}</span>}
            {showName && <span className='layout-logo-name'>{label}</span>}
        </a>
    );
}
