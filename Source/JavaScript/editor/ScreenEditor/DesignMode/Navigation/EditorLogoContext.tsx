// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createContext, useContext } from 'react';
import { LuLock } from 'react-icons/lu';

// What the application's logo looks like to the designer: its name, and whether the level being edited may not change it (NAV8).
export interface EditorLogo {
    title: string;
    locked: boolean;
    lockedReason: string;
}

export const EditorLogoContext = createContext<EditorLogo | undefined>(undefined);

// The logo box at the start of the topbar: solid where it is defined - the application - and dashed with a padlock in a module, where it is shown but may not
// be changed (p04-1, p11-1). The designer draws it itself because a blueprint's topbar takes its logo from a slot; the preview and Stage draw the logo of the
// application's navigation model with the rest of the shell.
export const EditorLogoBox = () => {
    const logo = useContext(EditorLogoContext);
    if (!logo) return null;
    return (
        <span className='studio-design-logo' data-locked={logo.locked ? 'true' : undefined} title={logo.locked ? logo.lockedReason : logo.title}>
            <span className='studio-design-logo__title'>{logo.title}</span>
            {logo.locked && <LuLock className='studio-design-logo__lock' aria-hidden='true' />}
        </span>
    );
};
