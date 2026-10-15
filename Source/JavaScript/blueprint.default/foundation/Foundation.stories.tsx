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
