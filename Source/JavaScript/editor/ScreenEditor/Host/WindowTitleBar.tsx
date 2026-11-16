// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ReactNode } from 'react';
import './WindowTitleBar.css';

export interface WindowTitleBarProps {
    controls: ReactNode;

    // What names the thing being edited, at the start of the bar, when the host has one.
    title?: ReactNode;
}

// The strip across the top of the editor window. It holds the window's controls and nothing else: a title centred in it
// would be drawn over them.
export const WindowTitleBar = ({ controls, title }: WindowTitleBarProps) => (
    <div className='studio-window-title-bar' role='toolbar'>
        {title && <div className='studio-window-title-bar__title'>{title}</div>}
        <div className='studio-window-title-bar__controls'>{controls}</div>
    </div>
);
