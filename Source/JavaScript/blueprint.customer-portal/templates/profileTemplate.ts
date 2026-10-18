// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { profileScreenTemplate } from '@cratis/scene.blueprint.default';
import { CustomerPortalQuery, fromQuery, localeOfData } from '../customerPortalQueries';
import { customerPortalMetadata, component } from '../customerPortalParts';

/** The portal profile: the contact with the people they work with, tabbed sections of details and preferences, and what they changed lately. */
export const portalProfileTemplate: ScreenTemplate = {
    name: 'PortalProfile',
    fitsSlot: 'content',
    slots: profileScreenTemplate.slots,
    arrangement: profileScreenTemplate.arrangement,
    content: {
        header: [component('PortalProfile-header', 'pageHeader', { title: fromQuery(CustomerPortalQuery.PortalProfileValues, '0.name'), subtitle: fromQuery(CustomerPortalQuery.PortalProfileValues, '0.role') })],
        summary: [
            component('PortalProfile-team', 'avatarStack', { label: 'Your contacts here', people: fromQuery(CustomerPortalQuery.PortalPeople) }),
            component('PortalProfile-status', 'statusChip', { status: fromQuery(CustomerPortalQuery.PortalProfileValues, '0.status'), tone: 'success' }),
        ],
        tabs: [component('PortalProfile-tabs', 'tabSet', { tabs: fromQuery(CustomerPortalQuery.PortalProfileTabs), urlKey: 'ptab', label: 'Profile sections' })],
        details: [component('PortalProfile-form', 'formScreenBody', { mode: 'settings', sections: fromQuery(CustomerPortalQuery.PortalProfileSections), values: fromQuery(CustomerPortalQuery.PortalProfileValues, '0'), errors: fromQuery(CustomerPortalQuery.FormErrors, '0'), ...localeOfData })],
        activity: [component('PortalProfile-activity', 'activityFeed', { label: 'Recent activity', entries: fromQuery(CustomerPortalQuery.PortalProfileActivity), ...localeOfData })],
    },
    displayName: 'Portal profile',
    description: 'The signed-in customer contact: their team, tabbed details, preferences and security, and recent activity.',
    metadata: customerPortalMetadata('PortalProfile', 'Profile', [TemplateScope.Module, TemplateScope.Feature]),
};
