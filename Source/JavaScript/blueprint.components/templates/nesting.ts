// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { SlotName, TemplateSlotName } from '@cratis/scene.blueprint.default';
import { invoiceColumns, invoiceTableOptions, observableDataTable } from './dataElements';
import { filterPanel } from './editorElements';
import { arcPageHeader, page, toolbar, toolbarButton, toolbarSeparator } from './elements';
import { SampleBindingName } from './SampleBindingName';

/**
 * A worked three-level chain, from the application layout down to one behavior.
 *
 * The nesting rule is one rule applied at every depth: a template names, in `fitsSlot`, a slot declared by
 * whatever contains it. A module's template fits the application layout's `content`; a feature's fits a
 * slot the module's declares; a slice's fits one the feature's declares. Nothing here is a special case
 * for a particular level, which is exactly why the hierarchy can be arbitrarily deep with no second
 * mechanism.
 *
 * The slot names are chosen so that each fitted name is declared by exactly one container in the chain -
 * `body` only by the module, `primary` only by the feature. That is not decoration: `resolveScreenTemplates`
 * places a template only when the containers in scope agree on exactly one home for it, and reports it as
 * unplaced rather than guessing when two of them declare the same name. A chain that reused `body` at
 * three levels would read fine and resolve to nothing.
 *
 * The whole chain is Arc-bound, which is the point of it living in *this* blueprint rather than being a
 * second copy of the default one's. It ends where a Cratis slice really ends: a button that summons the
 * command dialog.
 */

/**
 * Module level: fits the application shell's `content` slot.
 *
 * A module always has a name and a description, so it brings its own header, and it offers a body for the
 * feature inside it plus a side panel for the filters that apply across the whole module.
 */
export const dataModulePageTemplate: ScreenTemplate = {
    name: 'DataModulePage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.SidePanel }],
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('module-header', {
                title: 'Billing',
                subtitle: 'Everything the billing module owns',
                section: 'Operations',
            }),
        ],
        [TemplateSlotName.SidePanel]: [page('module-filters', 'Filters', [filterPanel('module-filter-panel', 'Filter the module')])],
    },
    displayName: 'Data module page',
    description: 'Module level: fits the application layout content slot and offers a body for one feature.',
};

/**
 * Feature level: fits the module page's `body` slot.
 *
 * A feature is where actions belong - a module is a grouping and a slice is one behavior, and the feature
 * in between is what a user thinks of as "the screen with the buttons on it". It offers a primary region
 * for the slice and a secondary one for the live view of what that slice is doing.
 */
export const dataFeatureSectionTemplate: ScreenTemplate = {
    name: 'DataFeatureSection',
    fitsSlot: TemplateSlotName.Body,
    slots: [{ name: TemplateSlotName.Toolbar }, { name: TemplateSlotName.Primary }, { name: TemplateSlotName.Secondary }],
    content: {
        [TemplateSlotName.Toolbar]: [
            toolbar('feature-toolbar', [
                toolbarButton('feature-new', 'Register an invoice', 'pi pi-plus', 'New'),
                toolbarButton('feature-adjust', 'Record an adjustment', 'pi pi-pencil', 'Adjust'),
                toolbarSeparator('feature-separator'),
                toolbarButton('feature-export', 'Export the feature data', 'pi pi-download'),
            ]),
        ],
        [TemplateSlotName.Secondary]: [
            page('feature-live', 'In flight', [
                observableDataTable('feature-live-table', SampleBindingName.InvoicesInFlight, invoiceTableOptions, invoiceColumns),
            ]),
        ],
    },
    displayName: 'Data feature section',
    description: 'Feature level: fits a module page body slot, brings the action toolbar and a live view.',
};

/**
 * Slice level: fits the feature section's `primary` slot.
 *
 * The end of the chain, and deliberately the thinnest thing in it. A slice is one behavior, and in a
 * Cratis application that behavior is one command - so its surface is a header saying what the command is
 * and whether it is wired, and the action that summons it. The capture itself happens in the `CommandDialog`
 * dialog template, which is why this template has no form on it and does not need one.
 */
export const commandSliceSectionTemplate: ScreenTemplate = {
    name: 'CommandSliceSection',
    fitsSlot: TemplateSlotName.Primary,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Actions }],
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('slice-header', {
                title: 'Record an adjustment',
                subtitle: 'One behavior, one command, one button',
                section: 'Adjustments',
                command: SampleBindingName.RecordAdjustment,
            }),
        ],
        [TemplateSlotName.Actions]: [
            toolbar('slice-actions', [
                toolbarButton('slice-record', 'Record an adjustment', 'pi pi-check', 'Record'),
                toolbarButton('slice-cancel', 'Leave the invoice as it is', 'pi pi-times', 'Cancel'),
            ]),
        ],
    },
    displayName: 'Command slice section',
    description: 'Slice level: fits a feature section primary slot and hosts one command behavior.',
};

/** The chain, outermost first - what a spec walks to prove `fitsSlot` resolves at every level. */
export const nestingChainTemplates: ScreenTemplate[] = [dataModulePageTemplate, dataFeatureSectionTemplate, commandSliceSectionTemplate];
