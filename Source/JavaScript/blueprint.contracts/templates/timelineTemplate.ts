// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { timelineScreenTemplate } from '@cratis/scene.blueprint.default';
import { ContractsQuery, fromQuery, localeOfData } from '../contractsQueries';
import { actionButton, component, goesTo, contractsMetadata, withBehaviors } from '../contractsParts';

interface TimelineOptions {
    name: string;
    displayName: string;
    description: string;
    title: string;
    subtitle: string;
    label: string;
    listLabel: string;
    searchLabel: string;
    items: string;
    columns: string;
    back: { label: string; screen: string };
}

/**
 * One timeline: the foundation `TimelineScreen` with every item as a bar in a lane, how far along it is, the milestones, what waits on what, and a conflict told in
 * words when one lane's bars overlap. The scale is kept in the address; on a phone the schedule is the table, and the same items are listed beneath.
 */
function timelineOf(options: TimelineOptions): ScreenTemplate {
    const id = options.name;
    return {
        name: options.name,
        fitsSlot: 'content',
        slots: timelineScreenTemplate.slots,
        arrangement: timelineScreenTemplate.arrangement,
        content: {
            header: [component(`${id}-header`, 'pageHeader', { title: options.title, subtitle: options.subtitle }, {
                actions: [withBehaviors(actionButton(`${id}-back`, options.back.label, 'secondary'), goesTo(options.back.screen))],
            })],
            toolbar: [component(`${id}-search`, 'globalSearch', { placeholder: options.searchLabel, label: options.searchLabel, urlKey: 'timelineq' })],
            timeline: [component(`${id}-grid`, 'timelineGrid', {
                label: options.label, items: fromQuery(options.items), today: fromQuery(ContractsQuery.Settings, '0.today'), firstDay: fromQuery(ContractsQuery.Settings, '0.firstDay'), urlKey: 'scale', ...localeOfData,
            })],
            list: [component(`${id}-list`, 'dataList', { label: options.listLabel, rows: fromQuery(options.items), columns: fromQuery(options.columns), titleField: 'title', pageSize: 8, ...localeOfData })],
        },
        displayName: options.displayName,
        description: options.description,
        metadata: contractsMetadata(options.name, 'Timeline', [TemplateScope.Module, TemplateScope.Feature]),
    };
}

/** The contracts timeline: each live contract as a bar in a lane for its counterparty, how far through its term it is, and a milestone for each notice date; the list beneath names the same terms. */
export const contractsTimelineTemplate = timelineOf({
    name: 'ContractsTimeline', displayName: 'Contracts timeline', description: 'Every live contract as a bar from start to end in a lane for each counterparty, with how far through it is and the notice dates that matter.', title: 'Timeline', subtitle: 'Terms and notice dates by counterparty', label: 'Contract terms', listLabel: 'Terms',
    searchLabel: 'Search the timeline', items: ContractsQuery.ContractTimelineItems, columns: ContractsQuery.ContractTimelineColumns, back: { label: 'Open the contracts', screen: 'contracts.list' },
});
