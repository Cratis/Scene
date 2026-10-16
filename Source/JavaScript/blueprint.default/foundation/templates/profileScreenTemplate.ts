// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The profile screen (spec Part B 2.12): who a person is - their name and role, the team around them - then tabbed sections (details, preferences, security) and
 * their recent activity. The tabs live in the address; the form of a tab is editable in place with its own Save.
 */
export const profileScreenTemplate: ScreenTemplate = {
    name: 'ProfileScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'summary' }, { name: 'tabs' }, { name: 'details' }, { name: 'activity' }],
    arrangement: {
        root: column([slotLeaf('header'), slotLeaf('summary'), grid([column([slotLeaf('tabs'), slotLeaf('details')], 16, { span: 2 }), slotLeaf('activity')], 3, 16)], 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('summary'), slotLeaf('tabs'), slotLeaf('details'), slotLeaf('activity')], 16) }],
    },
    content: {
        header: [component('profile-header', 'pageHeader', { title: fromQuery('ProfileValues', '0.name'), subtitle: fromQuery('ProfileValues', '0.role') })],
        summary: [
            component('profile-team', 'avatarStack', { label: 'Team', people: fromQuery('People') }),
            component('profile-status', 'statusChip', { status: fromQuery('ProfileValues', '0.status'), tone: 'success' }),
        ],
        tabs: [component('profile-tabs', 'tabSet', { tabs: fromQuery('ProfileTabs'), urlKey: 'ptab', label: 'Profile sections' })],
        details: [component('profile-form', 'formScreenBody', { mode: 'settings', sections: fromQuery('ProfileSections'), values: fromQuery('ProfileValues', '0'), errors: fromQuery('FormErrors', '0') })],
        activity: [component('profile-activity', 'activityFeed', { label: 'Recent activity', entries: fromQuery('Activity') })],
    },
    displayName: 'Profile',
    description: 'A person with their team, tabbed sections of details, preferences and security, and recent activity.',
    metadata: { ...foundationTemplateProvenance, type: 'Profile', category: 'Foundation / Profile', thumbnail: thumbnailOf('ProfileScreen') },
};
