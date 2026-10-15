// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The form: titled sections of fields in a one-to-three column grid, validated, with Save, Save and new and Cancel. One template serves create, edit, read-only
 * and settings (a save for each section) by its mode, and warns before unsaved changes are lost.
 */
export const formScreenTemplate: ScreenTemplate = {
    name: 'FormScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'body' }, { name: 'actions' }],
    arrangement: {
        root: column([slotLeaf('header'), slotLeaf('body'), slotLeaf('actions')], 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('body'), slotLeaf('actions')], 16) }],
    },
    content: {
        header: [component('form-header', 'pageHeader', { title: 'New account', subtitle: 'Fields marked * are required' })],
        body: [component('form-body', 'formScreenBody', { mode: 'create', sections: fromQuery('RecordSections'), values: fromQuery('RecordValues', '0'), errors: fromQuery('FormErrors', '0') })],
        actions: [],
    },
    displayName: 'Form',
    description: 'Sections of validated fields with Save, Save and new, Cancel and an unsaved-changes guard.',
    metadata: { ...foundationTemplateProvenance, type: 'Form', category: 'Foundation / Form', thumbnail: thumbnailOf('FormScreen') },
};
