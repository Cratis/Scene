// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { SampleDataPack } from '@cratis/scene.model';
import { corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { defaultBlueprint } from '../defaultBlueprint';
import { ComponentState } from '../foundation';
import foundationPackText from '../sampleData/foundation-en.json?raw';
import { GalleryDialogPreview } from './GalleryDialogPreview';
import { GalleryScreenPreview } from './GalleryScreenPreview';
import { TemplatePreviewState } from './TemplatePreviewState';

const registry = mergePackageRegistries([corePackage, primeReactPackage, defaultBlueprint]);
const pack = JSON.parse(foundationPackText) as SampleDataPack;

/**
 * The foundation dialogs and the auth and state screens (spec Part B 2.10 and 2.11) in each state, filled from the foundation sample-data pack: the data in the
 * pack, an empty answer, and each of the standard states forced on the components that own them. A dialog opens in the box a host draws, which its frame takes on:
 * focus handling, placement and its name.
 */
const meta = {
    title: 'Blueprint/Foundation dialogs',
    component: GalleryDialogPreview,
    parameters: { layout: 'fullscreen' },
    args: { registry, pack, dialogName: 'ConfirmDialog' },
    tags: ['autodocs'],
} satisfies Meta<typeof GalleryDialogPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A destructive confirmation: the consequences listed, the confirming button naming what it does. */
export const Confirm: Story = {};

/** The short create form, six fields at most. */
export const QuickCreate: Story = { args: { dialogName: 'QuickCreateDialog' } };

/** The lookup with the pack's accounts. */
export const Lookup: Story = { args: { dialogName: 'LookupDialog' } };

/** The lookup when the query returns nothing: it says so in words. */
export const LookupEmpty: Story = { args: { dialogName: 'LookupDialog', state: TemplatePreviewState.Empty } };

/** The lookup while its query has not answered. */
export const LookupLoading: Story = { args: { dialogName: 'LookupDialog', forceState: { state: ComponentState.Loading } } };

/** The lookup when its query failed: a message and a retry. */
export const LookupError: Story = { args: { dialogName: 'LookupDialog', forceState: { state: ComponentState.Error, error: 'The server did not answer' } } };

/** The lookup for a user who may not see the accounts: what is missing, and none of the data. */
export const LookupNoPermission: Story = { args: { dialogName: 'LookupDialog', forceState: { state: ComponentState.NoPermission, permissionSubject: 'the accounts' } } };

/** The lookup when part of it failed: the chrome stays, and the failed part is named. */
export const LookupPartial: Story = { args: { dialogName: 'LookupDialog', forceState: { state: ComponentState.Partial, failedRegions: ['Accounts'] } } };

/** A drawer from the side hosting a form. */
export const SideSheet: Story = { args: { dialogName: 'SideSheet' } };

/** The advanced filter builder; on a phone it fills the page. */
export const Filter: Story = { args: { dialogName: 'FilterDialog' } };

/** Every state screen, as a gallery screen: sign in, not found, forbidden and error. */
export const StateScreens: StoryObj<typeof GalleryScreenPreview> = {
    render: args => <GalleryScreenPreview {...args} registry={registry} pack={pack} />,
    args: { screenName: 'LoginScreen' },
    argTypes: { screenName: { control: 'select', options: ['LoginScreen', 'NotFoundScreen', 'ForbiddenScreen', 'ErrorScreen'] } },
};
