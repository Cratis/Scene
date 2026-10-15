// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentCategory } from '@cratis/scene.model';
import { ComponentMetadata, componentMetadata as m } from '@cratis/scene.react';
import { ComponentName } from '../ComponentName';

/**
 * The category, icon, keywords and picker badge of every foundation component (CMP1), keyed by bare component name.
 * The names are those of `ComponentName`; the metadata of the rest of the package lives in `defaultBlueprintComponentMetadata`.
 */
export const foundationComponentMetadata: Record<string, ComponentMetadata> = {
    [ComponentName.EmptyState]: m('Empty state', ComponentCategory.Feedback, 'inbox', ['no data', 'nothing', 'blank slate', 'zero state']),
    [ComponentName.StatCard]: m('Stat card', ComponentCategory.DataDisplay, 'gauge', ['kpi', 'metric', 'figure', 'number', 'dashboard']),
    [ComponentName.TrendChip]: m('Trend chip', ComponentCategory.DataDisplay, 'trending-up', ['delta', 'change', 'arrow', 'comparison']),
    [ComponentName.StatusChip]: m('Status chip', ComponentCategory.DataDisplay, 'badge-check', ['badge', 'state', 'tag', 'label']),
    [ComponentName.ChartWrapper]: m('Chart', ComponentCategory.DataDisplay, 'chart-line', ['graph', 'line', 'bar', 'stacked', 'donut', 'pie', 'funnel', 'plot']),
    [ComponentName.FilterBuilder]: m('Filter builder', ComponentCategory.Input, 'list-filter', ['filter', 'query', 'conditions', 'and or', 'search']),
    [ComponentName.ColumnChooser]: m('Column chooser', ComponentCategory.Actions, 'columns-3', ['columns', 'fields', 'show hide', 'table']),
    [ComponentName.SavedViewsMenu]: m('Saved views menu', ComponentCategory.Actions, 'bookmark', ['views', 'presets', 'saved filters']),
};
