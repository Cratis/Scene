// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { administrationAuditLogTemplate, administrationUserListTemplate } from './listTemplates';
import { administrationUserPageTemplate } from './recordTemplates';
import { administrationRolesTemplate } from './rolesTemplate';
import { administrationSettingsTemplate } from './settingsTemplate';

export * from './listTemplates';
export * from './recordTemplates';
export * from './rolesTemplate';
export * from './settingsTemplate';
export * from './dialogTemplates';

/** Every screen template this blueprint provides, in the order the manifest lists them. */
export const administrationScreenTemplates = [
    administrationUserListTemplate, administrationUserPageTemplate,
    administrationRolesTemplate,
    administrationSettingsTemplate,
    administrationAuditLogTemplate,
];

export { administrationDialogs as administrationDialogTemplates } from './dialogTemplates';
