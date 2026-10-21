// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useId, useState } from 'react';
import { IconButton } from '@cratis/components/Common';
import { Dialog, DialogInitialFocus } from '@cratis/components/Dialogs';
import { RegisteredComponentProps, themeTokenProperty, useSceneTheme } from '@cratis/scene.react';
import { ShellIcon } from './ShellIcon';
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
 * Cratis Dialog supplies an end-placed side sheet, focus containment, dismissal and focus restoration.
 * Its portalled root receives the active Scene tokens so switching theme updates the panel as well as
 * the page without remounting either.
 */
export function ConfigPanel({ element, slots }: RegisteredComponentProps) {
    const { config, setColorScheme, setMenuTheme } = useLayoutConfig();
    const [isOpen, setIsOpen] = useState(false);
    const theme = useSceneTheme();
    const dialogId = useId();
    const themeStyle = Object.fromEntries(Object.entries(theme?.tokens ?? {}).map(([token, value]) => [themeTokenProperty(token), value]));
    const title = readString(element, 'title', 'Settings');
    const showsMenuTheme = readBoolean(element, 'showMenuTheme', true);
    const showsMode = readBoolean(element, 'showLayoutMode', true);

    return (
        <>
            <IconButton variant='solid' shape='pill' className='layout-icon-button layout-config-button' aria-label={title} aria-haspopup='dialog' aria-expanded={isOpen} aria-controls={isOpen ? dialogId : undefined} data-scene-id={element.id} icon={<ShellIcon name='cog' />} onClick={() => setIsOpen(true)} />
            <Dialog
                title={title}
                placement='end'
                visible={isOpen}
                onClose={() => setIsOpen(false)}
                buttons={null}
                dismissable
                initialFocus={DialogInitialFocus.Content}
                width='24rem'
                closeIcon={<ShellIcon name='times' />}
                closeAriaLabel={`Close ${title}`}
                className='layout-overlay-theme layout-config-surface'
                pt={{
                    root: { id: dialogId, style: themeStyle, 'data-scene-theme': theme?.name, 'data-scene-color-scheme': theme ? theme.isDark ? 'dark' : 'light' : undefined },
                    backdrop: { className: 'layout-config-backdrop' },
                    positioner: { className: 'layout-config-positioner' },
                    header: { className: 'layout-config-header' },
                    close: { className: 'layout-icon-button' },
                    content: { className: 'layout-config-body' },
                }}>
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
            </Dialog>
        </>
    );
}
