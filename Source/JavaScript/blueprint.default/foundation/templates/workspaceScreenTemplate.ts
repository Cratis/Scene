// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * A module's own workspace: its sections beside the content of the section in force. The sections are the module's sub-navigation (a left rail that
 * becomes tabs on a phone); the section in force is kept in the address, so a deep link or a refresh restores it. Feature screens go in `moduleContent`.
 */
export const workspaceScreenTemplate: ScreenTemplate = {
    name: 'WorkspaceScreen',
    fitsSlot: 'content',
    slots: [{ name: 'moduleNav' }, { name: 'moduleContent' }],
    arrangement: {
        root: grid([slotLeaf('moduleNav'), slotLeaf('moduleContent', { span: 3 })], 4, 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('moduleNav'), slotLeaf('moduleContent')], 16) }],
    },
    content: {
        moduleNav: [component('workspace-sections', 'subNavigation', { items: fromQuery('ModuleSections'), orientation: 'vertical', urlKey: 'section', label: 'Module sections' })],
        moduleContent: [],
    },
    displayName: 'Module workspace',
    description: 'A module\'s sections beside the content of the section that is open.',
    metadata: { ...foundationTemplateProvenance, type: 'Workspace', category: 'Foundation / Workspace', thumbnail: thumbnailOf('WorkspaceScreen') },
};
