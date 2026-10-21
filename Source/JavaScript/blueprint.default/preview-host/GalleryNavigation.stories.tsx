// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { PrimeReactStoryProvider } from './PrimeReactStoryProvider';
import { defaultBlueprint } from '../defaultBlueprint';
import { ScenePreviewHost } from './ScenePreviewHost';
import { galleryApplication, galleryComposition } from './galleryApplication';
import { DestinationGroup, listDestinations } from './listDestinations';

const registry = mergePackageRegistries([corePackage, primeReactPackage, defaultBlueprint]);
const document = galleryApplication();

const noStructure = { modules: [] };

function Application({ initial, mode }: { initial: string; mode: 'navigate' | 'select' }) {
    return (
        <PrimeReactStoryProvider>
            <ScenePreviewHost document={document} structure={noStructure} target={{ application: 'Gallery' }} registry={registry} composition={galleryComposition}
                initialDestination={{ screen: initial }} navigationMode={mode} />
        </PrimeReactStoryProvider>
    );
}

/**
 * The gallery as a navigable application (spec N1, N3, N5): every menu entry, crumb and user-menu entry opens its screen in the
 * shell through the host's navigation context, and the entry of the screen on the page is the current one. The host page's address
 * is never written.
 */
const meta = {
    title: 'Blueprint/Gallery navigation',
    component: Application,
    parameters: { layout: 'fullscreen' },
    args: { initial: 'Dashboard', mode: 'navigate' },
    argTypes: { mode: { control: 'inline-radio', options: ['navigate', 'select'] } },
} satisfies Meta<typeof Application>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Clicking Products renders the list in the shell, makes the entry current and follows with the breadcrumb. */
export const ClickAnEntry: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getAllByText('Products')[0]);
        await expect(canvasElement.querySelector('[data-scene-outlet="primary"]')!.getAttribute('data-scene-screen')).toBe('CrudList');
        await expect(canvasElement.querySelector('.layout-menu-link[aria-current="page"]')!.textContent).toContain('Products');
    },
};

/** A design host's mode: a click selects and reports the entry and does not leave the page. */
export const SelectInsteadOfNavigate: Story = {
    args: { mode: 'select' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getAllByText('Products')[0]);
        await expect(canvasElement.querySelector('[data-scene-outlet="primary"]')!.getAttribute('data-scene-screen')).toBe('Dashboard');
    },
};

/** The destinations a *Showing* picker offers, from `listDestinations`. */
export const Destinations: Story = {
    render: () => (
        <ul>
            {listDestinations(document).map(group => (
                <li key={group.group}>{group.group}: {group.destinations.map(destination => destination.label).join(', ')}</li>
            ))}
        </ul>
    ),
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText(new RegExp(`^${DestinationGroup.Dialogs}:`))).toBeTruthy();
    },
};
