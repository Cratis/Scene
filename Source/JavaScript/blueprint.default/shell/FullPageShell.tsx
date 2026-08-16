// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { LayoutConfigProvider, useOptionalLayoutConfig } from '../configuration';
import { SlotName } from '../layouts';

/**
 * The chrome-less shell: content, an optional branding aside, and the configurator.
 *
 * Login, register, password reset, verification, lock, error, access-denied, not-found and landing screens
 * all render here rather than in a stripped-down application shell. That split is structural in every
 * PrimeTek template, and for a good reason: those screens have no navigation state to hold, no sidebar to
 * remember, and no breadcrumb to place, so hanging them off the application shell means every one of the
 * eight modes has to have an answer for a page that has no menu.
 *
 * The configurator stays, because a sign-in page still has to honor the chosen theme - it is very often
 * the first page anyone sees.
 */
export function FullPageShell({ element, slots }: RegisteredComponentProps) {
    const surface = <FullPageSurface elementId={element.id} slots={slots} />;
    return useOptionalLayoutConfig() ? surface : <LayoutConfigProvider>{surface}</LayoutConfigProvider>;
}

interface FullPageSurfaceProps {
    elementId: string;
    slots: Record<string, ReactNode[]>;
}

function FullPageSurface({ elementId, slots }: FullPageSurfaceProps) {
    const hasAside = (slots[SlotName.Aside]?.length ?? 0) > 0;

    return (
        <div className='layout-full-page' data-scene-id={elementId}>
            {hasAside && <aside className='layout-full-page-aside'>{slots[SlotName.Aside]}</aside>}
            <main className='layout-full-page-content'>{slots[SlotName.Content]}</main>
            {slots[SlotName.ConfigPanel]}
        </div>
    );
}
