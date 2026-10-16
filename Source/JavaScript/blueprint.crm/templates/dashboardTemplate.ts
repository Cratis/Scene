// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { dashboardScreenTemplate } from '@cratis/scene.blueprint.default';
import { CrmEntityKind, CrmQuery, crmQueriesOf, currencyOfData, fromQuery, localeOfData } from '../crmQueries';
import { component, crmMetadata } from '../crmParts';

/**
 * The sales dashboard (the foundation Dashboard, Executive variant): three key figures - what is in the open pipeline, what was won this month and how
 * many leads become deals - over two charts, leads by source and deals by stage as a funnel, with the deals closing soon beneath and the signed-in
 * user's own tasks beside them. Every region is its own component with its own loading, empty and error states, so one failed query leaves the others.
 */
export const crmDashboardTemplate: ScreenTemplate = {
    name: 'CrmDashboard',
    fitsSlot: 'content',
    slots: dashboardScreenTemplate.slots,
    arrangement: dashboardScreenTemplate.arrangement,
    content: {
        header: [component('crm-dashboard-header', 'pageHeader', { title: 'Sales dashboard', subtitle: 'Pipeline, wins and conversion this month' })],
        kpis: [
            component('crm-kpi-pipeline', 'statCard', {
                label: 'Open pipeline value', value: fromQuery(CrmQuery.Kpis, '0.value'), change: fromQuery(CrmQuery.Kpis, '0.change'), format: 'currency', fractionDigits: 0, comparison: 'last month', ...currencyOfData,
            }),
            component('crm-kpi-won', 'statCard', {
                label: 'Won this month', value: fromQuery(CrmQuery.Kpis, '1.value'), change: fromQuery(CrmQuery.Kpis, '1.change'), format: 'currency', fractionDigits: 0, comparison: 'last month', ...currencyOfData,
            }),
            component('crm-kpi-conversion', 'statCard', {
                label: 'Conversion rate', value: fromQuery(CrmQuery.Kpis, '2.value'), change: fromQuery(CrmQuery.Kpis, '2.change'), format: 'percent', comparison: 'last month', ...localeOfData,
            }),
        ],
        charts: [
            component('crm-chart-sources', 'chartWrapper', {
                title: 'Leads by source', kind: 'donut', categories: fromQuery(CrmQuery.LeadsBySource, '0.categories'), series: fromQuery(CrmQuery.LeadsBySource, '0.series'), ...localeOfData,
            }),
            component('crm-chart-stages', 'chartWrapper', {
                title: 'Deals by stage', kind: 'funnel', categories: fromQuery(CrmQuery.DealsByStage, '0.categories'), series: fromQuery(CrmQuery.DealsByStage, '0.series'), ...localeOfData,
            }),
        ],
        tables: [component('crm-dashboard-deals', 'dataList', {
            label: 'Closing soon', rows: fromQuery(CrmQuery.ClosingSoon), columns: fromQuery(crmQueriesOf(CrmEntityKind.Deal).columns), titleField: 'name', pageSize: 5, ...localeOfData,
        })],
        aside: [component('crm-dashboard-tasks', 'checklistSection', { label: 'My tasks', sections: fromQuery(CrmQuery.MyTasks), ...localeOfData })],
    },
    displayName: 'CRM sales dashboard',
    description: 'Open pipeline value, won this month, conversion rate, leads by source, deals by stage and my tasks.',
    metadata: crmMetadata('CrmDashboard', 'Dashboard', [TemplateScope.Module, TemplateScope.Feature]),
};
