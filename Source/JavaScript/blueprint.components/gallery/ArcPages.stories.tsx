// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { LayoutMode } from '@cratis/scene.blueprint.default';
import { GalleryScreenPreview } from './GalleryScreenPreview';

/**
 * Every screen template this blueprint ships, booted through the real engine.
 *
 * Each story resolves the screen's bare component names against the real profile and renders the result
 * with `SceneElementView` and the real merged registry - the same path Studio's preview and a shipped
 * application take. Nothing here is rendered by calling a component directly, because a story that did
 * would prove only that the component compiles.
 */
const meta = {
    title: 'Blueprint/Arc pages',
    component: GalleryScreenPreview,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'The eight Arc-bound page templates plus the three-level nesting chain, each booted as a screen inside the default ' +
                    "blueprint's application shell. Nothing is registered in the binding registry, so every Arc-bound region names the " +
                    'binding it wanted and every page header says which query or command a host still has to wire. That is the normal ' +
                    'design-time state - see the *Bindings* stories for what changes when a host registers one.',
            },
        },
    },
    tags: ['autodocs'],
} satisfies Meta<typeof GalleryScreenPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The archetype: a `dataPage` bound to one query, under a header stating the binding. */
export const DataListPage: Story = { args: { screenName: 'DataListPage' } };

/** The live variant, over an observable query that re-renders when the read model changes. */
export const ObservableDataListPage: Story = { args: { screenName: 'ObservableDataListPage' } };

/** The whole list screen with the selected record's document and history beside it. */
export const DataListWithDetailPage: Story = { args: { screenName: 'DataListWithDetailPage' } };

/** A queried list in the larger column, the selected record in the narrower one. */
export const MasterDetailPage: Story = { args: { screenName: 'MasterDetailPage' } };

/** Four query-backed widgets, arranged the way people already read a dashboard. */
export const DashboardPage: Story = { args: { screenName: 'DashboardPage' } };

/** A generated command form with its own action bar. */
export const CommandFormPage: Story = { args: { screenName: 'CommandFormPage' } };

/** An event type's schema, edited as a typed property tree - and fully rendered, because nothing on it is Arc-bound. */
export const SchemaEditorPage: Story = { args: { screenName: 'SchemaEditorPage' } };

/** One document against its schema, with its trail and its version history. */
export const ObjectEditorPage: Story = { args: { screenName: 'ObjectEditorPage' } };

/** Module level: a template filling the application layout's content slot. */
export const DataModulePage: Story = { args: { screenName: 'DataModulePage' } };

/** Feature level: a template filling a slot the module template declares. */
export const DataFeatureSection: Story = { args: { screenName: 'DataFeatureSection' } };

/** Slice level: three templates deep, still landing in the layout's content slot. */
export const CommandSliceSection: Story = { args: { screenName: 'CommandSliceSection' } };

/**
 * The same page in the shell's slim mode.
 *
 * Here to make one thing visible: the eight layout modes are the default blueprint's, and an Arc page
 * dropped into its `content` slot gets every one of them for free. That is what layering on a blueprint
 * buys, and what shipping a rival shell would have cost.
 */
export const InTheSlimMode: Story = {
    args: { screenName: 'DataListPage', initialConfig: { mode: LayoutMode.Slim } },
};
