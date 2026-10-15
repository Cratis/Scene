// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind, ComponentDescriptor, PropertyDescriptor, PropertyEditorKind, PropertyValueType } from '@cratis/scene.model';
import { componentRegistryKey } from '@cratis/scene.react';
import { ComponentName } from '../ComponentName';
import { defaultBlueprintName } from '../packageName';
import { ComponentState } from './ComponentState';
import { NumberFormat } from './formatting';
import { PermissionRule } from './PermissionRule';
import { StatusTone } from './StatusChip';

/** Data properties take what a screen binds them to: a query's result, a data context or another component's output. */
export const bindable = [BindingSourceKind.DataContext, BindingSourceKind.QueryResult, BindingSourceKind.ComponentProperty];

const text = (path: string, label: string, group: string, description?: string, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor =>
    ({ path, label, group, valueType: PropertyValueType.String, ...(group === 'Data' ? { acceptedBindingKinds: bindable } : {}), ...(description === undefined ? {} : { description }), ...extra });

const number = (path: string, label: string, group: string, description?: string, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor =>
    ({ path, label, group, valueType: PropertyValueType.Number, editorKind: PropertyEditorKind.Number, ...(group === 'Data' ? { acceptedBindingKinds: bindable } : {}), ...(description === undefined ? {} : { description }), ...extra });

const flag = (path: string, label: string, group: string, description?: string, extra: Partial<PropertyDescriptor> = {}): PropertyDescriptor =>
    ({ path, label, group, valueType: PropertyValueType.Boolean, editorKind: PropertyEditorKind.Boolean, ...(description === undefined ? {} : { description }), ...extra });

const choice = (path: string, label: string, group: string, values: Record<string, string>, defaultValue: string, description?: string): PropertyDescriptor =>
    ({
        path, label, group, valueType: PropertyValueType.Enum, editorKind: PropertyEditorKind.Enum, default: defaultValue,
        choices: Object.entries(values).map(([value, name]) => ({ value, label: name })), ...(description === undefined ? {} : { description }),
    });

export const list = (path: string, label: string, group: string, itemLabel: string, properties: PropertyDescriptor[], description?: string): PropertyDescriptor =>
    ({ path, label, group, valueType: PropertyValueType.Collection, default: [], item: { label: itemLabel, properties }, ...(description === undefined ? {} : { description }) });

const rule = (path: string, label: string, description: string): PropertyDescriptor =>
    choice(path, label, 'Permissions', { [PermissionRule.Enabled]: 'Enabled', [PermissionRule.Disabled]: 'Disabled', [PermissionRule.Hidden]: 'Hidden' }, PermissionRule.Enabled, description);

/** The properties every data-showing foundation component shares: the standard states (spec Part B 1.4) and the cross-cutting rules of 1.5. */
export const standardStateProperties: PropertyDescriptor[] = [
    choice('state', 'Preview state', 'State', {
        [ComponentState.Ready]: 'Ready', [ComponentState.Loading]: 'Loading', [ComponentState.Empty]: 'Empty',
        [ComponentState.Error]: 'Error', [ComponentState.NoPermission]: 'No permission', [ComponentState.Partial]: 'Partial',
    }, ComponentState.Ready, 'Forces a state so each can be designed and previewed; empty means the state follows the bound data.'),
    text('error', 'Error message', 'State', 'The message of the error state; setting it puts the component in that state.'),
    flag('loading', 'Loading', 'State', 'Shows the skeleton while the data has not answered.'),
    flag('forbidden', 'Not allowed', 'State', 'Shows the no-permission state, which explains what is missing and shows no data.'),
    text('permissionSubject', 'What access is missing', 'State', 'Names what the user cannot see in the no-permission message.'),
    { path: 'failedRegions', label: 'Failed regions', group: 'State', valueType: PropertyValueType.Json, editorKind: PropertyEditorKind.StringList, default: [], description: 'The parts that failed to load; any entry puts the component in the partial state.' },
    text('emptyHeadline', 'Empty headline', 'State'),
    text('emptyHint', 'Empty hint', 'State'),
    text('emptyActionLabel', 'Empty action', 'State', 'The primary action offered when there is nothing to show.'),
    rule('actionPermission', 'Empty action permission', 'Whether the empty state offers its action, refuses it with a reason, or does not render it.'),
    text('label', 'Label', 'Accessibility', 'The accessible name of the region.'),
    text('locale', 'Locale', 'Content', 'The locale dates, numbers and currency are formatted in; empty follows the document.'),
    choice('density', 'Density', 'Appearance', { comfortable: 'Comfortable', compact: 'Compact' }, 'comfortable'),
    { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap, description: 'Replaces the text the component says itself, for localization.' },
];

const key = (name: ComponentName) => componentRegistryKey(defaultBlueprintName, name);

const formats = { [NumberFormat.Number]: 'Number', [NumberFormat.Currency]: 'Currency', [NumberFormat.Percent]: 'Percent', [NumberFormat.Compact]: 'Compact' };

/** What can be edited on the foundation components (Part B 4). Each declares the shape of its data, never values (SD1). */
export const foundationDescriptors: ComponentDescriptor[] = [
    {
        component: key(ComponentName.EmptyState),
        displayName: 'Empty state',
        description: 'An icon, a headline, a hint and one primary action; embeddable in any region.',
        properties: [
            text('headline', 'Headline', 'Content', undefined, { default: 'Nothing here yet' }),
            text('hint', 'Hint', 'Content'),
            text('icon', 'Icon', 'Appearance'),
            text('actionLabel', 'Primary action', 'Behavior', 'The label of the one action the state offers; its behaviors say what it does.'),
            rule('actionPermission', 'Action permission', 'Whether the action works, refuses with a reason, or is not rendered.'),
            text('locale', 'Locale', 'Content'),
            { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap },
        ],
    },
    {
        component: key(ComponentName.StatCard),
        displayName: 'Stat card',
        description: 'One key figure with its label, trend and the period the trend is compared to.',
        properties: [
            text('label', 'Label', 'Content', 'What the figure measures.', { constraints: { required: true } }),
            number('value', 'Value', 'Data', 'The figure; bind it to a query result.'),
            choice('format', 'Format', 'Appearance', formats, NumberFormat.Number),
            text('currency', 'Currency', 'Appearance', 'The ISO 4217 code when the format is currency.'),
            number('fractionDigits', 'Fraction digits', 'Appearance'),
            number('change', 'Change', 'Data', 'How much the figure moved, as a percentage; bind it to a query result.'),
            choice('goodDirection', 'Good direction', 'Appearance', { up: 'Up is good', down: 'Down is good' }, 'up', 'Which movement is good: a falling response time is.'),
            text('comparison', 'Compared to', 'Content', 'The period the change is compared to, for example "last month".'),
            ...standardStateProperties.filter(property => property.path !== 'label'),
        ],
    },
    {
        component: key(ComponentName.TrendChip),
        displayName: 'Trend chip',
        description: 'A change drawn as a direction, a magnitude and whether the movement is good.',
        properties: [
            number('change', 'Change', 'Data', 'The movement; bind it to a query result.'),
            choice('format', 'Format', 'Appearance', formats, NumberFormat.Percent),
            choice('goodDirection', 'Good direction', 'Appearance', { up: 'Up is good', down: 'Down is good' }, 'up'),
            text('comparison', 'Compared to', 'Content'),
            text('locale', 'Locale', 'Content'),
            { path: 'strings', label: 'Text overrides', group: 'Content', valueType: PropertyValueType.Object, editorKind: PropertyEditorKind.StringMap },
        ],
    },
    {
        component: key(ComponentName.StatusChip),
        displayName: 'Status chip',
        description: 'A status shown as a semantic color, an icon and its text; the text is always shown.',
        properties: [
            text('status', 'Status', 'Data', 'The status text; bind it to a query result.', { constraints: { required: true } }),
            choice('tone', 'Tone', 'Appearance', {
                [StatusTone.Success]: 'Success', [StatusTone.Warning]: 'Warning', [StatusTone.Danger]: 'Danger', [StatusTone.Info]: 'Info', [StatusTone.Neutral]: 'Neutral',
            }, StatusTone.Neutral, 'The tone picks the icon and the theme color.'),
        ],
    },
];

