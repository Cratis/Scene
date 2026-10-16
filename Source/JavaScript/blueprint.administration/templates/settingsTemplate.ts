// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { formScreenTemplate } from '@cratis/scene.blueprint.default';
import { AdministrationQuery, fromQuery, localeOfData } from '../administrationQueries';
import { administrationMetadata, component } from '../administrationParts';

/**
 * Settings: the foundation `FormScreen`, Settings variant - the form is in `settings` mode, so each section (general, branding and notifications) has its own Save
 * and nothing is saved until its section is. The current values are the form's `values`, so what the organization has chosen is what is shown.
 */
export const administrationSettingsTemplate: ScreenTemplate = {
    name: 'AdministrationSettings',
    fitsSlot: 'content',
    slots: formScreenTemplate.slots,
    arrangement: formScreenTemplate.arrangement,
    content: {
        header: [component('AdministrationSettings-header', 'pageHeader', { title: 'Settings', subtitle: 'Each section is saved on its own' })],
        body: [component('AdministrationSettings-body', 'formScreenBody', {
            mode: 'settings', sections: fromQuery(AdministrationQuery.SettingsSections), values: fromQuery(AdministrationQuery.SettingsValues, '0'), errors: fromQuery(AdministrationQuery.FormErrors, '0'), ...localeOfData,
        })],
        actions: [],
    },
    displayName: 'Administration settings',
    description: 'General, branding and notification settings, each section with its own Save.',
    metadata: administrationMetadata('AdministrationSettings', 'Form', [TemplateScope.Module, TemplateScope.Feature]),
};
