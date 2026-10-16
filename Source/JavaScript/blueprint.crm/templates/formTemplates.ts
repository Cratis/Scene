// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { formScreenTemplate, quickCreateDialogTemplate } from '@cratis/scene.blueprint.default';
import { CrmEntityKind, CrmQuery, crmQueriesOf, currencyOfData, fromQuery, localeOfData } from '../crmQueries';
import { component, crmMetadata, withBehaviors, closesDialog } from '../crmParts';

const formScopes = [TemplateScope.Feature, TemplateScope.Subfeature];

type FormMode = 'create' | 'edit';

/**
 * One CRM form: the foundation `FormScreen` - sections of validated fields, Save, Save and new, Cancel and the unsaved-changes guard - for an entity, in
 * create mode (empty, with Save and new) or edit mode (showing the record). Two templates rather than a switch because what differs is what the form is
 * bound to: a create form is bound to nothing, an edit form to the record.
 */
function formTemplateOf(entity: CrmEntityKind, mode: FormMode): ScreenTemplate {
    const queries = crmQueriesOf(entity);
    const name = `Crm${entity}${mode === 'create' ? 'Create' : 'Edit'}Form`;
    const noun = entity.toLowerCase();

    return {
        name,
        fitsSlot: 'content',
        slots: formScreenTemplate.slots,
        arrangement: formScreenTemplate.arrangement,
        content: {
            header: [component(`${name}-header`, 'pageHeader', mode === 'create'
                ? { title: `New ${noun}`, subtitle: 'Fields marked * are required' }
                : { title: fromQuery(queries.record, '0.name'), subtitle: `Edit ${noun}` })],
            body: [component(`${name}-body`, 'formScreenBody', {
                mode, sections: fromQuery(queries.sections), errors: fromQuery(CrmQuery.FormErrors, '0'), ...currencyOfData,
                ...(mode === 'edit' ? { values: fromQuery(queries.record, '0') } : {}),
            })],
            actions: [],
        },
        displayName: `CRM ${mode} ${noun}`,
        description: mode === 'create' ? `A form that creates one ${noun}.` : `A form that edits one ${noun}.`,
        metadata: crmMetadata(name, 'Form', formScopes),
    };
}

const kinds = [CrmEntityKind.Lead, CrmEntityKind.Contact, CrmEntityKind.Company, CrmEntityKind.Deal, CrmEntityKind.Activity] as const;

/** The create and edit forms of the five entities: the four main ones and the activities logged against them. */
export const crmFormTemplates: ScreenTemplate[] = kinds.flatMap(entity => [formTemplateOf(entity, 'create'), formTemplateOf(entity, 'edit')]);

/**
 * One quick-create dialog: the foundation `QuickCreateDialog` - a short form opened from a list's header to make one record without leaving the page -
 * with the fields an entity needs to get started.
 */
function quickCreateOf(entity: CrmEntityKind): DialogTemplate {
    const name = `CrmQuickCreate${entity}`;
    const queries = crmQueriesOf(entity);
    const noun = entity === CrmEntityKind.Activity ? 'activity' : entity.toLowerCase();
    const verb = entity === CrmEntityKind.Activity ? 'Log' : 'New';

    return {
        name,
        slots: quickCreateDialogTemplate.slots,
        content: {
            header: [component(`${name}-frame`, 'dialogFrame', { title: `${verb} ${noun}`, subtitle: 'Only what is needed to get started' })],
            body: [withBehaviors(component(`${name}-form`, 'formScreenBody', {
                mode: 'create', saveAndNew: false, strings: { formSave: 'Create' }, sections: fromQuery(queries.quickSections), errors: fromQuery(CrmQuery.FormErrors, '0'), ...currencyOfData,
            }), closesDialog())],
            actions: [],
        },
        displayName: `CRM quick create ${noun}`,
        description: `A short form that creates one ${noun} without leaving the page.`,
        metadata: crmMetadata(name, 'Dialog', [TemplateScope.Slice]),
    };
}

/** The quick-create dialogs: one for each entity, activities included. */
export const crmQuickCreateDialogs: DialogTemplate[] = kinds.map(quickCreateOf);
