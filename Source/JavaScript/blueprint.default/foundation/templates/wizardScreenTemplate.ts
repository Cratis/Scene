// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { column, grid, row, slotLeaf } from '../../layouts/flowBuilders';
import { component, foundationTemplateProvenance, fromQuery, thumbnailOf } from './templateParts';

/**
 * The wizard: linear steps with a progress list, Back and Next, and a save-draft. The last step is the review. Where the person has got to survives a refresh,
 * and a refresh can never land past a step that was not done. The content of each step is the slot named by its id.
 */
export const wizardScreenTemplate: ScreenTemplate = {
    name: 'WizardScreen',
    fitsSlot: 'content',
    slots: [{ name: 'header' }, { name: 'progress' }, { name: 'step' }, { name: 'actions' }],
    arrangement: {
        root: column([slotLeaf('header'), slotLeaf('progress'), slotLeaf('step'), slotLeaf('actions')], 16),
        overrides: [{ width: WidthSizeClass.Compact, root: column([slotLeaf('header'), slotLeaf('progress'), slotLeaf('step'), slotLeaf('actions')], 16) }],
    },
    content: {
        header: [component('wizard-header', 'pageHeader', { title: 'New account', subtitle: 'Three short steps' })],
        progress: [component('wizard-progress', 'wizardProgress', { steps: fromQuery('WizardSteps'), urlKey: 'step' }, {
            details: [component('wizard-details', 'formScreenBody', { mode: 'create', sections: fromQuery('RecordSections'), values: fromQuery('RecordValues', '0') })],
            people: [component('wizard-people', 'avatarStack', { people: fromQuery('People') })],
            review: [component('wizard-review', 'formScreenBody', { mode: 'readOnly', sections: fromQuery('RecordSections'), values: fromQuery('RecordValues', '0') })],
        })],
        step: [],
        actions: [],
    },
    displayName: 'Wizard',
    description: 'Linear steps with progress, back and next, a saved draft and a review step.',
    metadata: { ...foundationTemplateProvenance, type: 'Wizard', category: 'Foundation / Wizard', thumbnail: thumbnailOf('WizardScreen') },
};
