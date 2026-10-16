// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, TemplateScope } from '@cratis/scene.model';
import { quickCreateDialogTemplate } from '@cratis/scene.blueprint.default';
import { HrQuery, fromQuery, localeOfData } from '../hrQueries';
import { closesDialog, component, hrMetadata, withBehaviors } from '../hrParts';

/**
 * One quick-create dialog: the foundation `QuickCreateDialog` - a short form opened from a page to make one record without leaving it - with the fields
 * that thing needs to get started.
 */
function quickCreateOf(name: string, title: string, subtitle: string, sections: string, noun: string, create: string): DialogTemplate {
    return {
        name,
        slots: quickCreateDialogTemplate.slots,
        content: {
            header: [component(`${name}-frame`, 'dialogFrame', { title, subtitle })],
            body: [withBehaviors(component(`${name}-form`, 'formScreenBody', {
                mode: 'create', saveAndNew: false, strings: { formSave: create }, sections: fromQuery(sections), errors: fromQuery(HrQuery.FormErrors, '0'), ...localeOfData,
            }), closesDialog())],
            actions: [],
        },
        displayName: `HR quick create ${noun}`,
        description: noun === 'time-off request' ? 'A short form that asks for time off without leaving the page.' : `A short form that creates one ${noun} without leaving the page.`,
        metadata: hrMetadata(name, 'Dialog', [TemplateScope.Slice]),
    };
}

/** Request time off (type, dates, a note), and the quick creation of an employee. */
export const hrQuickCreateDialogs: DialogTemplate[] = [
    quickCreateOf('HrRequestTimeOff', 'Request time off', 'Say when and what kind', 'TimeOffQuickSections', 'time-off request', 'Send request'),
    quickCreateOf('HrQuickCreateEmployee', 'New employee', 'Only what is needed to get started', 'EmployeeQuickSections', 'employee', 'Create'),
];
