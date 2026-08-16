// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { useLayoutConfig } from '../configuration';
import { defaultBlueprintThemes } from '../themes';
import { readString } from './elementProperties';
import { readThemeOptions, themeOptionsFor } from './ThemeOption';

/**
 * Switches between the themes a host offers.
 *
 * It records a name and a color scheme and nothing else - {@link LayoutThemeProvider} resolves the name
 * against the real theme set. That split is what makes switching live: the tokens are rewritten on the
 * element that already exists, so nothing below remounts and no form loses what was typed into it.
 */
export function ThemeSwitcher({ element }: RegisteredComponentProps) {
    const { config, setThemeName, setColorScheme } = useLayoutConfig();
    const label = readString(element, 'label', 'Theme');
    const options = readThemeOptions(element, themeOptionsFor(defaultBlueprintThemes));

    return (
        <div data-scene-id={element.id}>
            <h3 className='layout-config-section-title'>{label}</h3>
            <div className='layout-config-options' role='group' aria-label={label}>
                {options.map(option => (
                    <button
                        key={option.name}
                        type='button'
                        className='layout-config-option'
                        aria-pressed={config.themeName === option.name}
                        onClick={() => {
                            setThemeName(option.name);
                            setColorScheme(option.colorScheme);
                        }}>
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
