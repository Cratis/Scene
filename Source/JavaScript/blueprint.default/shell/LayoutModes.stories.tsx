// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { LayoutMode, MenuTheme } from '../configuration';
import { GalleryScreenPreview } from '../gallery';

/**
 * One story per layout mode, all showing the same dashboard.
 *
 * Showing the *same* screen in every mode is the point: the difference between a docked sidebar, an icon
 * rail, a horizontal strip and a panel that slides in on hover is entirely in the wrapper class and the
 * stylesheet, and nothing about the screen changes. A story per mode is how that claim stays true.
 */
const meta = {
    title: 'Blueprint/Layout modes',
    component: GalleryScreenPreview,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'The eight menu modes, each rendering the same dashboard. Below 991px every one of them is forced off-canvas - resize the preview to see it.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof GalleryScreenPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

function inMode(mode: LayoutMode, extra: Record<string, unknown> = {}): Story['args'] {
    return { screenName: 'Dashboard', initialConfig: { mode, ...extra } };
}

/** The sidebar is docked and the content is pushed by a matching margin. */
export const Static: Story = { args: inMode(LayoutMode.Static) };

/** The sidebar is parked off-canvas; the topbar toggle floats it over the content behind the mask. */
export const Overlay: Story = { args: inMode(LayoutMode.Overlay) };

/** An icon-only rail with circular buttons; submenus pop out beside it. */
export const Slim: Story = { args: inMode(LayoutMode.Slim) };

/** The same rail, wider, with each label stacked under its icon. */
export const SlimPlus: Story = { args: inMode(LayoutMode.SlimPlus) };

/** The icon rail again, with square buttons and a topbar shifted by the rail width. */
export const Compact: Story = { args: inMode(LayoutMode.Compact) };

/** The sidebar stops being a sidebar and flows into the topbar as a row. */
export const Horizontal: Story = { args: inMode(LayoutMode.Horizontal) };

/** A full panel parked off-left behind a strip of icons - hover slides it in over the content. */
export const Reveal: Story = { args: inMode(LayoutMode.Reveal) };

/** A collapsed rail that grows its width on hover, and can be pinned open. */
export const Drawer: Story = { args: inMode(LayoutMode.Drawer) };

/** A pinned drawer, which pushes the content out to the full sidebar width instead of covering it. */
export const DrawerAnchored: Story = { args: inMode(LayoutMode.Drawer, { isSidebarAnchored: true, isSidebarRevealed: true }) };

/** A dark sidebar against a light page - the most common brand customization in the template line. */
export const DarkMenu: Story = { args: inMode(LayoutMode.Static, { menuTheme: MenuTheme.Dark }) };

/** The topbar toggle opens and closes the sidebar, and the wrapper class follows it. */
export const Interactive: Story = {
    args: inMode(LayoutMode.Static),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const wrapper = canvasElement.querySelector('.layout-wrapper')!;
        await expect(wrapper.className).not.toContain('layout-static-inactive');

        await userEvent.click(canvas.getByRole('button', { name: 'Close the menu' }));
        await expect(canvasElement.querySelector('.layout-wrapper')!.className).toContain('layout-static-inactive');

        await userEvent.click(canvas.getByRole('button', { name: 'Open the menu' }));
        await expect(canvasElement.querySelector('.layout-wrapper')!.className).not.toContain('layout-static-inactive');
    },
};
