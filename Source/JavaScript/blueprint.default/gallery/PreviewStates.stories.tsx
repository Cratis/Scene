// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { corePackage, mergePackageRegistries } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { defaultBlueprint } from '../defaultBlueprint';
import { GalleryScreenPreview } from './GalleryScreenPreview';
import { TemplatePreviewState } from './TemplatePreviewState';

/**
 * The data templates in each data state, rendered against the packages the blueprint depends on - `core`,
 * PrimeReact and the blueprint itself - so the tables are PrimeReact's own and each state is the table's own
 * empty message, loading status or error alert rather than a placeholder.
 */
const registry = mergePackageRegistries([corePackage, primeReactPackage, defaultBlueprint]);

const meta = {
    title: 'Blueprint/Preview states',
    component: GalleryScreenPreview,
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: 'Populated, empty, loading and error states of the data templates, through the real packages.' } },
    },
    args: { registry },
    argTypes: { state: { control: 'select', options: Object.values(TemplatePreviewState) } },
    tags: ['autodocs'],
} satisfies Meta<typeof GalleryScreenPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The list with its seeded products. */
export const ListPopulated: Story = { args: { screenName: 'CrudList', state: TemplatePreviewState.Populated } };

/** The list once the query returns nothing. */
export const ListEmpty: Story = { args: { screenName: 'CrudList', state: TemplatePreviewState.Empty } };

/** The list while the query has not answered. */
export const ListLoading: Story = { args: { screenName: 'CrudList', state: TemplatePreviewState.Loading } };

/** The list when the query failed. */
export const ListError: Story = { args: { screenName: 'CrudList', state: TemplatePreviewState.Error } };

/** Master/detail with its customers. */
export const MasterDetailPopulated: Story = { args: { screenName: 'MasterDetail', state: TemplatePreviewState.Populated } };

/** Master/detail while loading. */
export const MasterDetailLoading: Story = { args: { screenName: 'MasterDetail', state: TemplatePreviewState.Loading } };

/** The dashboard when its widgets' data failed to load. */
export const DashboardError: Story = { args: { screenName: 'Dashboard', state: TemplatePreviewState.Error } };

/** User administration with no users yet. */
export const UsersEmpty: Story = { args: { screenName: 'UserManagement', state: TemplatePreviewState.Empty } };
