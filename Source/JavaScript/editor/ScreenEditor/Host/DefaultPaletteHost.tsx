// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import { Toolbar } from '@cratis/components/Toolbar';
import './DefaultPaletteHost.css';

export interface DefaultPaletteHostProps {
    // `floating` pins the palette to the edge of the screen, for the editor that floats above the page; `inline` leaves it
    // where it is rendered, for the editor that is set into one.
    placement: 'floating' | 'inline';
    children: ReactNode;
}

// Where the palette goes when the host has no toolbar of its own to put it in. Studio mounts the palette in its application
// toolbar; a host without one would otherwise have an editor in which nothing can be added to the screen.
export const DefaultPaletteHost = ({ placement, children }: DefaultPaletteHostProps) => (
    <div className='studio-screen-editor-palette-host' data-placement={placement} data-cratis-part='screen-editor-palette'>
        <Toolbar>{children}</Toolbar>
    </div>
);
