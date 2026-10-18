// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DialogTemplate, TemplateScope } from '@cratis/scene.model';
import { quickCreateDialogTemplate } from '@cratis/scene.blueprint.default';
import { VendorsQuery, fromQuery, localeOfData } from '../vendorsQueries';
import { closesDialog, component, vendorsMetadata, withBehaviors } from '../vendorsParts';

/**
 * One quick-create dialog: the foundation `QuickCreateDialog` - a short form opened from a page to make one record without leaving it - with the fields
 * that thing needs to get started.
 */
function quickCreateOf(name: string, title: string, sections: string, noun: string, submit: string): DialogTemplate {
    return {
        name,
        slots: quickCreateDialogTemplate.slots,
        content: {
            header: [component(`${name}-frame`, 'dialogFrame', { title, subtitle: 'Only what is needed to get started' })],
            body: [withBehaviors(component(`${name}-form`, 'formScreenBody', {
                mode: 'create', saveAndNew: false, strings: { formSave: submit }, sections: fromQuery(sections), errors: fromQuery(VendorsQuery.FormErrors, '0'), ...localeOfData,
            }), closesDialog())],
            actions: [],
        },
        displayName: `Vendors quick create ${noun}`,
        description: `A short form that creates one ${noun} without leaving the page.`,
        metadata: vendorsMetadata(name, 'Dialog', [TemplateScope.Slice]),
    };
}

/** The quick dialogs of the blueprint. */
export const vendorsDialogs: DialogTemplate[] = [
    quickCreateOf('VendorsQuickCreateVendor', 'New vendor', 'VendorQuickSections', 'vendor', 'Create'),
];
