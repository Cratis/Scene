// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Button } from 'primereact/button';
import { Drawer } from 'primereact/drawer';
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
 * The panel is `primereact/drawer`, which is the slide-in overlay this component has always wanted.
 * PrimeReact 11 gave the name `Sidebar` to something else entirely - a new app-shell primitive with
 * `SidebarLayout`/`SidebarAside`/`SidebarPanel` parts - so the v10 `Sidebar` import this file used to
 * carry would still resolve after the upgrade and would silently render an app shell inside the shell.
 * That is the one rename in the whole library that fails quietly rather than loudly, which is why it is
 * called out here: this is `Drawer`, deliberately, and it is not the {@link Sidebar} next door either -
 * that one is this package's own component for the docked panel's chrome.
 *
 * Open state is the drawer's own. `Drawer.Trigger` renders in place through `Drawer.Root`'s fragment, so
 * the floating cog sits exactly where it did while getting `aria-expanded`/`aria-controls` from the
 * component rather than from hand-written props that can drift out of step with the panel.
 */
export function ConfigPanel({ element, slots }: RegisteredComponentProps) {
    const { config, setColorScheme, setMenuTheme } = useLayoutConfig();
    const title = readString(element, 'title', 'Settings');
    const showsMenuTheme = readBoolean(element, 'showMenuTheme', true);
    const showsMode = readBoolean(element, 'showLayoutMode', true);

    return (
        <Drawer.Root position='right'>
            <Drawer.Trigger as={Button} rounded iconOnly className='layout-config-button' aria-label={title} data-scene-id={element.id}>
                <i className='pi pi-cog' aria-hidden='true' />
            </Drawer.Trigger>
            <Drawer.Portal>
                <Drawer.Backdrop />
                <Drawer.Popup>
                    <Drawer.Header>
                        <Drawer.Title>{title}</Drawer.Title>
                        <Drawer.Close aria-label={`Close ${title}`}>
                            <i className='pi pi-times' aria-hidden='true' />
                        </Drawer.Close>
                    </Drawer.Header>
                    <Drawer.Content>
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
                    </Drawer.Content>
                </Drawer.Popup>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
