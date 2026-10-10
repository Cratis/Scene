// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { SlotName, TemplateSlotName, column, slotLeaf } from '@cratis/scene.blueprint.default';
import { arcPageHeader, page, toolbar, toolbarButton, toolbarSeparator } from './elements';
import { commandForm } from './formElements';
import { SampleBindingName } from './SampleBindingName';
import { componentsBlueprintTemplateProvenance } from '../templateProvenance';

/**
 * The write side: a page whose body is one command, and whose action bar submits it.
 */

/**
 * A command form page - a header, the generated form, and the bar that closes it.
 *
 * The form is `commandForm`, which is `AutoCommandForm`: it reads the command's own property descriptors
 * and picks a field component per property type. That is the whole reason a *template* can ship a form at
 * all. A template that listed fields by hand would be a snapshot of a command as it looked the day the
 * template was written, and would go quietly wrong the first time a property was added on the backend.
 * This one follows the command, which is the same guarantee Arc's generated proxies give everywhere else.
 *
 * `exclude` names the properties the form should not generate. `invoiceId` is excluded because it is the
 * event-source identity - Arc resolves it, and a form offering to type it in is offering to break it.
 *
 * The action bar is the template's rather than the form's, and it declares its own slot for that reason: a
 * screen replacing "Register" with "Register and approve" should not have to replace the form.
 */
export const commandFormPageTemplate: ScreenTemplate = {
    name: 'CommandFormPage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    arrangement: {
        root: column([slotLeaf(TemplateSlotName.Header), slotLeaf(TemplateSlotName.Body, { grow: 1 }), slotLeaf(TemplateSlotName.Actions)], 16),
    },
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('command-form-header', {
                title: 'Register an invoice',
                subtitle: 'The form follows the command, so a property added on the backend shows up here',
                section: 'Billing',
                command: SampleBindingName.RegisterInvoice,
            }),
        ],
        [TemplateSlotName.Body]: [page('command-form-body', '', [commandForm('command-form', SampleBindingName.RegisterInvoice, ['invoiceId'])])],
        [TemplateSlotName.Actions]: [
            toolbar('command-form-actions', [
                toolbarButton('command-form-submit', 'Register the invoice', 'pi pi-check', 'Register'),
                toolbarSeparator('command-form-separator'),
                toolbarButton('command-form-cancel', 'Discard and go back', 'pi pi-times', 'Cancel'),
            ]),
        ],
    },
    metadata: { ...componentsBlueprintTemplateProvenance, type: 'Form', category: 'Business / Command', scopes: [TemplateScope.Slice] },
    displayName: 'Command form page',
    description: 'A generated command form under a header that states the command, with its own action bar.',
};

/**
 * A settings page - the same generated-form shape as `CommandFormPage`, for the command that changes how a
 * module behaves rather than one that records something. The header says what the settings govern, the
 * form follows the settings command, and the bar saves or discards.
 *
 * Settings are a page of their own rather than a dialog because they are visited, read and left; a dialog
 * would hide the module the reader is configuring.
 */
export const settingsPageTemplate: ScreenTemplate = {
    name: 'SettingsPage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    arrangement: {
        root: column([slotLeaf(TemplateSlotName.Header), slotLeaf(TemplateSlotName.Body, { grow: 1 }), slotLeaf(TemplateSlotName.Actions)], 16),
    },
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('settings-header', {
                title: 'Billing settings',
                subtitle: 'Payment terms, reminders and numbering for every invoice the module registers',
                section: 'Billing',
                command: SampleBindingName.ChangeBillingSettings,
            }),
        ],
        [TemplateSlotName.Body]: [page('settings-body', '', [commandForm('settings-form', SampleBindingName.ChangeBillingSettings, ['billingId'])])],
        [TemplateSlotName.Actions]: [
            toolbar('settings-actions', [
                toolbarButton('settings-save', 'Save the settings', 'pi pi-save', 'Save'),
                toolbarSeparator('settings-separator'),
                toolbarButton('settings-discard', 'Discard changes', 'pi pi-undo', 'Discard'),
            ]),
        ],
    },
    metadata: { ...componentsBlueprintTemplateProvenance, type: 'Form', category: 'Business / Settings', scopes: [TemplateScope.Module] },
    displayName: 'Settings page',
    description: "A module's settings as a generated command form, with save and discard.",
};

/** The command-shaped templates. */
export const commandTemplates: ScreenTemplate[] = [commandFormPageTemplate, settingsPageTemplate];
