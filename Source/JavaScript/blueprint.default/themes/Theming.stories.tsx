// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { ColorScheme, LayoutConfigProvider, LayoutMode, useLayoutConfig } from '../configuration';
import { GalleryScreenPreview, externalComponent } from '../gallery';
import { ComponentName } from '../ComponentName';
import { ThemeSwitcher } from '../shell';
import { LayoutThemeProvider } from './LayoutThemeProvider';
import { defaultBlueprintThemes } from './defaultBlueprintThemes';

/**
 * Switching theme is live re-resolution, not a reload.
 *
 * `SceneThemeProvider` writes the new token values onto the element that is already there, so nothing below
 * it remounts - the sidebar stays where it was, an open menu stays open, and anything typed into a form is
 * still there. The switcher below only ever records a theme *name*; resolving that name against the theme
 * set is `LayoutThemeProvider`'s job, which is what lets a host substitute its own brand palettes without
 * touching the switcher.
 */
const meta = {
    title: 'Blueprint/Theming',
    component: GalleryScreenPreview,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'The two themes this blueprint ships, and a switcher proving the swap is live rather than a reload.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof GalleryScreenPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The dashboard on the light palette. */
export const Light: Story = { args: { screenName: 'Dashboard', initialConfig: { themeName: 'Scene Default Light', colorScheme: ColorScheme.Light } } };

/** The same dashboard on the dark palette - the same ten tokens, different values. */
export const Dark: Story = {
    args: { screenName: 'Dashboard', initialConfig: { themeName: 'Scene Default Dark', colorScheme: ColorScheme.Dark, mode: LayoutMode.Static } },
};

const switcherElement = externalComponent('theme-switcher', ComponentName.ThemeSwitcher, {
    label: 'Theme',
    themes: defaultBlueprintThemes.map(theme => ({ name: theme.name, label: theme.name, isDark: theme.isDark ?? false })),
});

function AppliedTheme() {
    const { config } = useLayoutConfig();
    return <output data-testid='applied-theme'>{`${config.themeName} · ${config.colorScheme}`}</output>;
}

function ThemeSwitchingDemo() {
    return (
        <LayoutConfigProvider storage={null}>
            <LayoutThemeProvider>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <ThemeSwitcher element={switcherElement} slots={{}} />
                    <AppliedTheme />
                </div>
            </LayoutThemeProvider>
        </LayoutConfigProvider>
    );
}

/** Click a theme and the tokens are rewritten in place - no reload, no remount, no lost state. */
export const Switcher: Story = {
    args: { screenName: 'Dashboard' },
    parameters: { layout: 'padded' },
    render: () => <ThemeSwitchingDemo />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Scene Default Dark' }));
        await expect(canvas.getByTestId('applied-theme').textContent).toContain('Scene Default Dark');

        const themed = canvasElement.querySelector('[data-scene-theme-root]') as HTMLElement;
        await expect(themed.getAttribute('data-scene-color-scheme')).toBe('dark');
        await expect(themed.style.getPropertyValue('--scene-surface-card')).toBe('#171a23');

        await userEvent.click(canvas.getByRole('button', { name: 'Scene Default Light' }));
        await expect(themed.getAttribute('data-scene-color-scheme')).toBe('light');
        await expect(themed.style.getPropertyValue('--scene-surface-card')).toBe('#ffffff');
    },
};
