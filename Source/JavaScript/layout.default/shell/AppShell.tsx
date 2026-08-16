// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { LayoutConfigProvider, isPointerRevealMode, useLayoutConfig, useOptionalLayoutConfig } from '../configuration';
import { SlotName } from '../layouts';
import { LayoutMask } from './Mask';

/**
 * The application shell: the `AppShell` layout's slots, positioned.
 *
 * This owns the positioned boxes - the fixed topbar, the sliding sidebar panel, the pushed main column -
 * while the components filling the slots own what goes inside them. Splitting it there is what lets a
 * screen replace the entire menu without knowing anything about how `reveal` mode translates the panel it
 * lives in.
 *
 * It puts a {@link LayoutConfigProvider} around itself when a host has not, because a gallery preview
 * hands the renderer one `appShell` element and nothing else, and the shell still has to be able to
 * switch modes.
 */
export function AppShell({ element, slots }: RegisteredComponentProps) {
    const surface = <AppShellSurface elementId={element.id} slots={slots} />;
    return useOptionalLayoutConfig() ? surface : <LayoutConfigProvider>{surface}</LayoutConfigProvider>;
}

interface AppShellSurfaceProps {
    elementId: string;
    slots: Record<string, ReactNode[]>;
}

function AppShellSurface({ elementId, slots }: AppShellSurfaceProps) {
    const { config, effectiveMode, wrapperClasses, setSidebarRevealed } = useLayoutConfig();
    const revealsOnPointer = isPointerRevealMode(effectiveMode);
    const hasSidebar = filled(slots, SlotName.Sidebar) || filled(slots, SlotName.Menu);

    return (
        <div className={wrapperClasses.join(' ')} data-scene-id={elementId} data-layout-mode={config.mode}>
            {filled(slots, SlotName.Topbar) && <header className='layout-topbar'>{slots[SlotName.Topbar]}</header>}

            {hasSidebar && (
                <aside
                    className='layout-sidebar'
                    onMouseEnter={revealsOnPointer ? () => setSidebarRevealed(true) : undefined}
                    onMouseLeave={revealsOnPointer ? () => setSidebarRevealed(false) : undefined}>
                    {slots[SlotName.Sidebar]}
                    {slots[SlotName.Menu]}
                </aside>
            )}

            <div className='layout-main'>
                {filled(slots, SlotName.Breadcrumb) && <div className='layout-breadcrumb'>{slots[SlotName.Breadcrumb]}</div>}
                <main className='layout-content'>{slots[SlotName.Content]}</main>
                {filled(slots, SlotName.Footer) && <footer className='layout-footer'>{slots[SlotName.Footer]}</footer>}
            </div>

            {filled(slots, SlotName.RightPanel) && <aside className='layout-right-panel'>{slots[SlotName.RightPanel]}</aside>}
            {slots[SlotName.ConfigPanel]}
            <LayoutMask />
        </div>
    );
}

function filled(slots: Record<string, ReactNode[]>, name: SlotName): boolean {
    return (slots[name]?.length ?? 0) > 0;
}
