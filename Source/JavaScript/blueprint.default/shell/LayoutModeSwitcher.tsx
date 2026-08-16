// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { LayoutMode, layoutModes, useLayoutConfig } from '../configuration';
import { readString } from './elementProperties';

/** What each mode is called in the configurator - the same names the PrimeTek template line uses. */
const modeLabels: Record<LayoutMode, string> = {
    [LayoutMode.Static]: 'Static',
    [LayoutMode.Overlay]: 'Overlay',
    [LayoutMode.Slim]: 'Slim',
    [LayoutMode.SlimPlus]: 'Slim+',
    [LayoutMode.Compact]: 'Compact',
    [LayoutMode.Horizontal]: 'Horizontal',
    [LayoutMode.Reveal]: 'Reveal',
    [LayoutMode.Drawer]: 'Drawer',
};

/**
 * Switches between the layout modes.
 *
 * Below the mobile breakpoint every button is disabled and the panel says why, rather than the picker
 * disappearing. A control that vanishes reads as a bug; a disabled control with a sentence next to it
 * reads as a decision - and the choice is still recorded and still there when the window grows again.
 */
export function LayoutModeSwitcher({ element }: RegisteredComponentProps) {
    const { config, setMode } = useLayoutConfig();
    const label = readString(element, 'label', 'Menu mode');

    return (
        <div data-scene-id={element.id}>
            <h3 className='layout-config-section-title'>{label}</h3>
            <div className='layout-config-options' role='group' aria-label={label}>
                {layoutModes.map(mode => (
                    <button
                        key={mode}
                        type='button'
                        className='layout-config-option'
                        disabled={config.isMobile}
                        aria-pressed={config.mode === mode}
                        onClick={() => setMode(mode)}>
                        {modeLabels[mode]}
                    </button>
                ))}
            </div>
            {config.isMobile && <p className='layout-config-note'>Below 991px every mode renders off-canvas, so the choice is kept but not applied.</p>}
        </div>
    );
}
