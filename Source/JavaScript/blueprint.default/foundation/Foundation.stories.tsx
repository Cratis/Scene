// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from '../ComponentName';
import { FoundationStates } from './FoundationStates';

/**
 * The foundation components (spec Part B 4), each in every standard state - ready, loading, empty, error, no permission and
 * partial - in the light and the dark theme. Each component also has a right-to-left story.
 */
const meta = {
    title: 'Blueprint/Foundation components',
    component: FoundationStates,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof FoundationStates>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyStateLight: Story = { args: { component: ComponentName.EmptyState, theme: 'light' } };
export const EmptyStateDark: Story = { args: { component: ComponentName.EmptyState, theme: 'dark' } };
export const StatCardLight: Story = { args: { component: ComponentName.StatCard, theme: 'light' } };
export const StatCardDark: Story = { args: { component: ComponentName.StatCard, theme: 'dark' } };
export const StatCardRightToLeft: Story = { args: { component: ComponentName.StatCard, theme: 'light', rightToLeft: true, properties: { label: 'خط الأنابيب', locale: 'ar-EG' } } };
export const TrendChipLight: Story = { args: { component: ComponentName.TrendChip, theme: 'light' } };
export const TrendChipDark: Story = { args: { component: ComponentName.TrendChip, theme: 'dark' } };
export const StatusChipLight: Story = { args: { component: ComponentName.StatusChip, theme: 'light' } };
export const StatusChipDark: Story = { args: { component: ComponentName.StatusChip, theme: 'dark' } };
export const ChartLineLight: Story = { args: { component: ComponentName.ChartWrapper, theme: 'light' } };
export const ChartLineDark: Story = { args: { component: ComponentName.ChartWrapper, theme: 'dark' } };
export const ChartBarLight: Story = { args: { component: ComponentName.ChartWrapper, theme: 'light', properties: { kind: 'bar' } } };
export const ChartBarDark: Story = { args: { component: ComponentName.ChartWrapper, theme: 'dark', properties: { kind: 'bar' } } };
export const ChartStackedLight: Story = { args: { component: ComponentName.ChartWrapper, theme: 'light', properties: { kind: 'stacked' } } };
export const ChartStackedDark: Story = { args: { component: ComponentName.ChartWrapper, theme: 'dark', properties: { kind: 'stacked' } } };
export const ChartDonutLight: Story = { args: { component: ComponentName.ChartWrapper, theme: 'light', properties: { kind: 'donut' } } };
export const ChartDonutDark: Story = { args: { component: ComponentName.ChartWrapper, theme: 'dark', properties: { kind: 'donut' } } };
export const ChartFunnelLight: Story = { args: { component: ComponentName.ChartWrapper, theme: 'light', properties: { kind: 'funnel', categories: ['Leads', 'Qualified', 'Proposal', 'Won'], series: [{ name: 'Deals', values: [400, 220, 90, 40] }] } } };
export const ChartFunnelDark: Story = { args: { component: ComponentName.ChartWrapper, theme: 'dark', properties: { kind: 'funnel', categories: ['Leads', 'Qualified', 'Proposal', 'Won'], series: [{ name: 'Deals', values: [400, 220, 90, 40] }] } } };
export const FilterBuilderLight: Story = { args: { component: ComponentName.FilterBuilder, theme: 'light' } };
export const FilterBuilderDark: Story = { args: { component: ComponentName.FilterBuilder, theme: 'dark' } };
export const ColumnChooserLight: Story = { args: { component: ComponentName.ColumnChooser, theme: 'light' } };
export const ColumnChooserDark: Story = { args: { component: ComponentName.ColumnChooser, theme: 'dark' } };
export const SavedViewsMenuLight: Story = { args: { component: ComponentName.SavedViewsMenu, theme: 'light' } };
export const SavedViewsMenuDark: Story = { args: { component: ComponentName.SavedViewsMenu, theme: 'dark' } };
export const ChecklistLight: Story = { args: { component: ComponentName.ChecklistSection, theme: 'light' } };
export const ChecklistDark: Story = { args: { component: ComponentName.ChecklistSection, theme: 'dark' } };
export const ActivityFeedLight: Story = { args: { component: ComponentName.ActivityFeed, theme: 'light' } };
export const ActivityFeedDark: Story = { args: { component: ComponentName.ActivityFeed, theme: 'dark' } };
export const AvatarStackLight: Story = { args: { component: ComponentName.AvatarStack, theme: 'light' } };
export const AvatarStackDark: Story = { args: { component: ComponentName.AvatarStack, theme: 'dark' } };
export const FileUploaderLight: Story = { args: { component: ComponentName.FileUploader, theme: 'light' } };
export const FileUploaderDark: Story = { args: { component: ComponentName.FileUploader, theme: 'dark' } };
