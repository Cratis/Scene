// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Theme } from '@cratis/scene.model';
import { SceneElementView, SceneThemeProvider } from '@cratis/scene.react';
import { primeReactComponents } from '../primeReactComponents';
import { sceneComponent, sceneGallery } from '../storyElements';
import { primeReactThemes } from './primeReactThemes';
import { usePrimeReactTheme } from './usePrimeReactTheme';

const showcase = sceneGallery('theme-showcase', [
    sceneComponent('themeTitle', 'title', { text: 'Live theme switching', level: 3 }),
    sceneComponent('themeButtons', 'buttonGroup', { buttons: ['Save', 'Duplicate', 'Archive'] }),
    sceneComponent('themeDropdown', 'dropdown', { options: ['Draft', 'In review', 'Published'], value: 'In review' }),
    sceneComponent('themeSwitch', 'toggleSwitch', { label: 'Notify the team', checked: true }),
    sceneComponent('themeTable', 'table', {
        rows: [
            { name: 'Ada', role: 'Engineer' },
            { name: 'Grace', role: 'Admiral' },
        ],
    }),
    sceneComponent('themeMessage', 'message', { severity: 'info', text: 'Every surface below follows the selected theme.' }),
    sceneComponent('themeSummary', 'summary', {
        title: 'At a glance',
        items: [
            { label: 'Status', value: 'Active' },
            { label: 'Owner', value: 'Ada' },
        ],
    }),
]);

/**
 * Both halves of theming, wired together the way an application does it.
 *
 * `usePrimeReactTheme` swaps the compiled PrimeReact stylesheet that skins the components;
 * `SceneThemeProvider` writes the same theme's semantic tokens onto the wrapping element, which is what
 * reaches this package's own wrappers and anything else reading `--scene-*`. Neither half is enough
 * alone - drop the hook and PrimeReact's components keep the old skin; drop the provider and the
 * wrappers around them do not follow.
 *
 * Nothing reloads and nothing below the provider remounts, so state survives the switch: type into a
 * field, change the theme, and what you typed is still there.
 */
const ThemeSwitcher = () => {
    const [theme, setTheme] = useState<Theme>(primeReactThemes[0]);
    usePrimeReactTheme(theme);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <select
                aria-label='Theme'
                value={theme.name}
                onChange={(event) => setTheme(primeReactThemes.find((candidate) => candidate.name === event.target.value) ?? primeReactThemes[0])}>
                {primeReactThemes.map((candidate) => (
                    <option key={candidate.name} value={candidate.name}>
                        {candidate.name}
                        {candidate.isDark ? ' (dark)' : ''}
                    </option>
                ))}
            </select>
            <SceneThemeProvider theme={theme}>
                <div style={{ padding: '1rem' }}>
                    <SceneElementView element={showcase} registry={primeReactComponents} resolveBinding={() => undefined} />
                </div>
            </SceneThemeProvider>
        </div>
    );
};

const meta = {
    title: 'PrimeReact/Theme switching',
    component: ThemeSwitcher,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'Switch between all 25 free PrimeTek themes this package ships. Every theme credits PrimeTek and is used under the MIT license the primereact package ships under.',
            },
        },
    },
} satisfies Meta<typeof ThemeSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Pick a theme and watch the stylesheet and the tokens change together, with no reload. */
export const Playground: Story = {};
