// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';
import { wizardScreenTemplate } from './wizardScreenTemplate';

/**
 * The import wizard (spec Part B 2.12): **upload** a file, **map** its columns to the fields of the record, **preview** what will be imported with the rows that
 * cannot be, then **confirm**. It is the foundation wizard, so the step survives a refresh and cannot land past a step that was not done; the mapping is a form,
 * the preview a list that names each rejected row's reason in words.
 */
export const importWizardTemplate: ScreenTemplate = {
    name: 'ImportWizard',
    fitsSlot: 'content',
    slots: wizardScreenTemplate.slots,
    arrangement: wizardScreenTemplate.arrangement,
    content: {
        header: [component('import-header', 'pageHeader', { title: 'Import contacts', subtitle: 'Four short steps' })],
        progress: [component('import-progress', 'wizardProgress', { steps: fromQuery('ImportSteps'), urlKey: 'importstep' }, {
            upload: [component('import-upload', 'fileUploader', { accept: '.csv, .xlsx', maxSizeMb: 20, multiple: false, actionPermission: 'enabled' })],
            map: [component('import-map', 'formScreenBody', { mode: 'create', sections: fromQuery('ImportMappingSections'), values: fromQuery('ImportMappingValues', '0'), errors: fromQuery('FormErrors', '0') })],
            preview: [
                component('import-summary', 'notice', { text: fromQuery('ImportSummary', '0.message'), tone: 'info' }),
                component('import-preview', 'dataList', { label: 'Rows to import', rows: fromQuery('ImportPreview'), columns: fromQuery('ImportPreviewColumns'), titleField: 'name', pageSize: 8 }),
            ],
            confirm: [component('import-confirm', 'formScreenBody', { mode: 'readOnly', sections: fromQuery('ImportConfirmSections'), values: fromQuery('ImportConfirmValues', '0') })],
        })],
        step: [],
        actions: [],
    },
    displayName: 'Import wizard',
    description: 'Upload a file, map its columns, preview what will be imported and confirm; the step survives a refresh.',
    metadata: { ...foundationTemplateProvenance, type: 'Import', category: 'Foundation / Import', thumbnail: thumbnailOf('ImportWizard') },
};
