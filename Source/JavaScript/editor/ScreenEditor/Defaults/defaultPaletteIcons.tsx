// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FaThLarge } from 'react-icons/fa';
import type { PaletteIcons } from '../Palette/buildPalette';
import { iconComponentOf } from './defaultComponentIcons';
import { defaultLayoutIcons } from './defaultLayoutIcons';
import { defaultPackageIcons, unknownPackageIcon } from './defaultPackageIcons';

// The icons of the palette: one per layout container, one for a component, and one for each drawer - Layout's own, and a package's
// by its name.
export const defaultPaletteIcons: PaletteIcons = {
    layout: item => {
        const Icon = defaultLayoutIcons[item];
        return <Icon aria-hidden='true' />;
    },
    component: componentName => {
        const Icon = iconComponentOf(componentName);
        return <Icon aria-hidden='true' />;
    },
    drawer: {
        layout: <FaThLarge aria-hidden='true' />,
        package: packageName => {
            const Icon = defaultPackageIcons[packageName] ?? unknownPackageIcon;
            return <Icon aria-hidden='true' />;
        },
    },
};
