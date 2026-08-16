// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import { Button } from 'primereact/button';
import { Sidebar } from 'primereact/sidebar';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ColorScheme, MenuTheme, colorSchemes, menuThemes, useLayoutConfig } from '../configuration';
import { LayoutModeSwitcher } from './LayoutModeSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';
import { readBoolean, readString } from './elementProperties';

/** What each color scheme is called in the configurator. */
const colorSchemeLabels: Record<ColorScheme, string> = {
    [ColorScheme.Light]: 'Light',
    [ColorScheme.Dark]: 'Dark',
};

/** What each menu theme is called in the configurator. */
const menuThemeLabels: Record<MenuTheme, string> = {
    [MenuTheme.Light]: 'Light',
    [MenuTheme.Dark]: 'Dark',
    [MenuTheme.Primary]: 'Primary',
};

/**
 * The floating configurator.
 *
 * The axes are the ones the modern PrimeTek templates expose - color scheme, menu mode, menu theme and
 * theme - because those are the four choices that actually change how an application feels, and a
 * configurator with more knobs than that becomes a settings screen nobody finishes reading.
 *
 * The panel itself is PrimeReact 10's `Sidebar`, which is an overlay drawer rather than an app-shell
 * sidebar - this is the one use it was designed for. (v11 renames it `Drawer` precisely to stop the
 * confusion, and gives the app-shell role to a new `Sidebar`.)
 */
export function ConfigPanel({ element, slots }: RegisteredComponentProps) {
    const [isVisible, setIsVisible] = useState(false);
    const { config, setColorScheme, setMenuTheme } = useLayoutConfig();
    const title = readString(element, 'title', 'Settings');
    const showsMenuTheme = readBoolean(element, 'showMenuTheme', true);
    const showsMode = readBoolean(element, 'showLayoutMode', true);

    return (
        <>
            <Button
                type='button'
                rounded
                icon='pi pi-cog'
                className='layout-config-button'
                aria-label={title}
                data-scene-id={element.id}
                onClick={() => setIsVisible(true)}
            />
            <Sidebar visible={isVisible} position='right' header={title} onHide={() => setIsVisible(false)}>
                <div className='layout-config-panel'>
                    <div>
                        <h3 className='layout-config-section-title'>Color scheme</h3>
                        <div className='layout-config-options' role='group' aria-label='Color scheme'>
                            {colorSchemes.map(scheme => (
                                <button
                                    key={scheme}
                                    type='button'
                                    className='layout-config-option'
                                    aria-pressed={config.colorScheme === scheme}
                                    onClick={() => setColorScheme(scheme)}>
                                    {colorSchemeLabels[scheme]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ThemeSwitcher
                        element={{ ...element, id: `${element.id}-theme`, properties: { ...element.properties, label: 'Theme' } }}
                        slots={{}}
                    />

                    {showsMode && (
                        <LayoutModeSwitcher element={{ ...element, id: `${element.id}-mode`, properties: { label: 'Menu mode' } }} slots={{}} />
                    )}

                    {showsMenuTheme && (
                        <div>
                            <h3 className='layout-config-section-title'>Menu theme</h3>
                            <div className='layout-config-options' role='group' aria-label='Menu theme'>
                                {menuThemes.map(menuTheme => (
                                    <button
                                        key={menuTheme}
                                        type='button'
                                        className='layout-config-option'
                                        aria-pressed={config.menuTheme === menuTheme}
                                        onClick={() => setMenuTheme(menuTheme)}>
                                        {menuThemeLabels[menuTheme]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {slots.content}
                </div>
            </Sidebar>
        </>
    );
}
