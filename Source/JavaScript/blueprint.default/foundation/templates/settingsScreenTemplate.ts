// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The settings screen (spec Part B 2.12): the sections of an application's settings in a rail on one side and the form of the chosen section on the other.
 * The form is in `settings` mode, so each section has its own Save and nothing is saved until its section is; the chosen section lives in the address. On a phone
 * the rail becomes a row of tabs above the form.
 */
export const settingsScreenTemplate: ScreenTemplate = {
    name: 'SettingsScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'sections' }, { name: 'body' }],
    arrangement: {
        root: column([slotLeaf('header'), grid([slotLeaf('sections'), slotLeaf('body', { span: 3 })], 4, 24)], 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('sections'), slotLeaf('body')], 16) }],
    },
    content: {
        header: [component('settings-header', 'pageHeader', { title: 'Settings', subtitle: 'Each section is saved on its own' })],
        sections: [component('settings-sections', 'subNavigation', { label: 'Settings sections', items: fromQuery('SettingsRail'), orientation: 'vertical', urlKey: 'section' })],
        body: [component('settings-body', 'formScreenBody', { mode: 'settings', sections: fromQuery('SettingsSections'), values: fromQuery('SettingsValues', '0'), errors: fromQuery('FormErrors', '0') })],
    },
    displayName: 'Settings',
    description: 'Settings sections in a rail beside the form of the chosen section, each section saved on its own.',
    metadata: { ...foundationTemplateProvenance, type: 'Settings', category: 'Foundation / Settings', thumbnail: thumbnailOf('SettingsScreen') },
};
