// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { useSceneTheme } from '@cratis/scene.react';
import { readOptionalString, readString } from './elementProperties';

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
    const targetScreen = readString(element, 'targetScreen', 'Dashboard');

    return (
        <a className='layout-logo' href={`#/${targetScreen}`} data-scene-id={element.id}>
            {source ? <img src={source} alt={label} height={28} /> : <span className='layout-logo-mark'>{initials}</span>}
            <span>{label}</span>
        </a>
    );
}
