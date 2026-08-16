// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { GalleryScreenPreview } from './GalleryScreenPreview';

/**
 * Every screen template that renders inside the application shell, booted through the real engine.
 *
 * Each story resolves the screen's bare component names against the gallery profile and renders the result
 * with `SceneElementView` and the real registry - the same path Studio's preview and a shipped application
 * take. Nothing is rendered by calling a shell component directly, because a story that did would prove
 * only that the component compiles.
 */
const meta = {
    title: 'Blueprint/Application screens',
    component: GalleryScreenPreview,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: 'The ten in-application screen templates plus the three-level nesting chain, each booted through the real engine as a screen.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof GalleryScreenPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Four stat cards over two columns of widgets. */
export const Dashboard: Story = { args: { screenName: 'Dashboard' } };

/** A searchable product table with a header and a primary action. */
export const List: Story = { args: { screenName: 'CrudList' } };

/** One record: header, sections and a summary panel. */
export const Detail: Story = { args: { screenName: 'DetailView' } };

/** A grouped form covering the field types an application actually uses. */
export const Form: Story = { args: { screenName: 'FormPage' } };

/** The designed empty state for a list with nothing in it yet. */
export const Empty: Story = { args: { screenName: 'Empty' } };

/** Prose with a table of contents beside it. */
export const Documentation: Story = { args: { screenName: 'Documentation' } };

/** The signed-in user editing their own account. */
export const ProfileSettings: Story = { args: { screenName: 'ProfileSettings' } };

/** The people table, with roles and an invitation action. */
export const UserManagement: Story = { args: { screenName: 'UserManagement' } };

/** A printable document: parties, line items and totals. */
export const Invoice: Story = { args: { screenName: 'Invoice' } };

/** Searchable answers with a route to a human. */
export const Help: Story = { args: { screenName: 'Help' } };

/** Module level: a template fitting the application layout's content slot. */
export const ModuleWorkspace: Story = { args: { screenName: 'ModuleWorkspace' } };

/** Feature level: a template fitting a slot the module template declares. */
export const FeatureSection: Story = { args: { screenName: 'FeatureSection' } };

/** Slice level: three templates deep, still landing in the layout's content slot. */
export const SliceSection: Story = { args: { screenName: 'SliceSection' } };
