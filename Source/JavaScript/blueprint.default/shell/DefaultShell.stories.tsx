// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { LayoutMode } from '../configuration';
import { GalleryScreenPreview } from '../gallery/GalleryScreenPreview';
import { SampleDataPack } from '@cratis/scene.model';

const packUrl = new URL('../sampleData/foundation-en.json', import.meta.url).href;
const loadPack = async () => ({ pack: await (await fetch(packUrl)).json() as SampleDataPack });

/** The default package alone: no widget registry, provider, preset or icon font. */
const meta = {
    title: 'Blueprint Default/Shell/Default-only application',
    component: GalleryScreenPreview,
    parameters: { layout: 'fullscreen', controls: { disable: true } },
    loaders: [loadPack],
    render: (args, { loaded }) => <GalleryScreenPreview {...args} pack={loaded.pack as SampleDataPack} />,
    args: { screenName: 'RecordPage', initialConfig: { mode: LayoutMode.Static } },
} satisfies Meta<typeof GalleryScreenPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultOnly: Story = {};
