// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ticketingBlueprintName } from './packageName';
import { ticketingScreenDefinitions } from './ticketingScreenSet';
import { ticketingDialogTemplates, ticketingScreenTemplates } from './templates';

const description = 'A support desk: a dashboard, the ticket queue and its board, ticket pages with quick actions, a public portal form and a knowledge base.';

/**
 * This blueprint's declaration. A domain blueprint depends on the foundation set (`Cratis.Blueprint.Default`) and reuses its layouts, slots,
 * components and themes - it ships none of its own - and adds what is specific to the domain: templates, a ready-to-use screen set, sample data
 * and thumbnails. The package `version` is the blueprint's version: it is what a template reference pins and what "update available" compares.
 */
export const ticketingBlueprintManifest: ScenePackage = {
    name: ticketingBlueprintName,
    version: '1.0.0',
    kind: PackageKind.Blueprint,
    dependencies: [{ name: 'Cratis.Blueprint.Default', versionRange: '^1.0.0' }],
    components: [],
    layouts: [],
    screenTemplates: ticketingScreenTemplates.map(template => template.name),
    dialogTemplates: ticketingDialogTemplates.map(template => template.name),
    themes: [],
    displayName: 'Ticketing / Helpdesk',
    description,
    module: '@cratis/scene.blueprint.ticketing',
    license: 'MIT',
    licenseUrl: 'https://github.com/Cratis/Scene/blob/main/LICENSE',
    sampleData: [
        { id: 'ticketing-helpdesk', title: 'Ticketing · Helpdesk', locale: 'en-GB', path: 'sampleData/ticketing-helpdesk.json', description: 'A helpdesk queue of English support tickets.', columns: ['Reference', 'Subject', 'Requester', 'Organisation', 'Priority'], statusColumn: 'Status', statuses: { good: ['Resolved'], pending: ['New', 'Open', 'Pending'] } },
        { id: 'ticketing-service-desk-de', title: 'Ticketing · Service-Desk', locale: 'de-DE', path: 'sampleData/ticketing-service-desk-de.json', description: 'A German service desk queue of support tickets.', columns: ['Reference', 'Subject', 'Requester', 'Organisation', 'Priority'], statusColumn: 'Status', statuses: { good: ['Gelöst'], pending: ['Neu', 'Offen', 'Wartend'] } },
    ],
    blueprint: {
        domain: 'ticketing',
        description,
        thumbnail: 'thumbnails/ticketing.svg',
        screenSet: ticketingScreenDefinitions.map(({ name, title, description: screenDescription, template, parent, order }) => ({
            name, title, description: screenDescription, template, ...(parent === undefined ? {} : { parent }), ...(order === undefined ? {} : { order }),
        })),
        defaultSampleData: 'ticketing-helpdesk',
    },
};
