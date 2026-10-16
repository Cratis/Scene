// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { column, slotLeaf } from '@cratis/scene.blueprint.default';
import { HrQuery, fromQuery, localeOfData } from '../hrQueries';
import { actionButton, component, goesTo, hrMetadata, withBehaviors } from '../hrParts';

/**
 * The org chart: the company as a tree - who reports to whom, with each person's title and how many report to them. It follows the ARIA tree pattern, so it is as
 * usable from a keyboard and a screen reader as with a pointer, and the chosen person is kept in the address, so a link points at a place in the chart.
 */
export const hrOrgChartTemplate: ScreenTemplate = {
    name: 'HrOrgChart',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'chart' }],
    arrangement: { root: column([slotLeaf('header'), slotLeaf('chart')], 16) },
    content: {
        header: [component('HrOrgChart-header', 'pageHeader', { title: 'Org chart', subtitle: 'Who reports to whom' }, {
            actions: [withBehaviors(actionButton('HrOrgChart-directory', 'Open the directory', 'secondary'), goesTo('hr.directory'))],
        })],
        chart: [component('HrOrgChart-tree', 'orgTree', { nodes: fromQuery(HrQuery.OrgNodes), expandedDepth: 2, urlKey: 'person', strings: { orgTree: 'Org chart', orgReports: '{count} reports' }, ...localeOfData })],
    },
    displayName: 'HR org chart',
    description: 'The company as a tree of who reports to whom, with titles and report counts.',
    metadata: hrMetadata('HrOrgChart', 'Detail', [TemplateScope.Module, TemplateScope.Feature]),
};
