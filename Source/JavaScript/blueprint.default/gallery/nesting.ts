// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate } from '@cratis/scene.model';
import { ComponentName } from '../ComponentName';
import { SlotName, column, slotLeaf } from '../layouts';
import { TemplateSlotName } from './TemplateSlotName';
import { button, externalComponent } from './elements';
import { pageHeader } from './widgets';

/**
 * A worked three-level chain, from the application layout down to a slice.
 *
 * The nesting rule is one rule applied at every depth: a template names, in `fitsSlot`, a slot declared by
 * whatever contains it. A module's template fits the application layout's `content`; a feature's template
 * fits a slot the module's template declares; a slice's fits one the feature's declares. Nothing here is a
 * special case for a particular level - which is exactly why the hierarchy can be arbitrarily deep without
 * a second mechanism.
 *
 * These three exist to make that concrete and to be asserted by a spec, because "it composes recursively"
 * is the kind of claim that is true in a design document and wrong in the code.
 */

/**
 * Module level: fits the application shell's `content` slot.
 *
 * It brings its own header - a module always has a name and a description - and offers a body for the
 * feature inside it plus an optional side panel.
 */
export const moduleWorkspaceTemplate: ScreenTemplate = {
    name: 'ModuleWorkspace',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Body }, { name: TemplateSlotName.SidePanel }],
    content: {
        [TemplateSlotName.Header]: [pageHeader('module-header', 'Operations', 'Everything the operations module owns')],
    },
    displayName: 'Module workspace',
    description: 'Module level: fits the application layout content slot and offers a body for one feature.',
};

/**
 * Feature level: fits the module workspace's `body` slot.
 *
 * It brings a toolbar, because a feature is where actions belong - a module is a grouping, a slice is one
 * behavior, and the feature in between is what a user thinks of as a screen with buttons on it.
 */
export const featureSectionTemplate: ScreenTemplate = {
    name: 'FeatureSection',
    fitsSlot: TemplateSlotName.Body,
    slots: [{ name: TemplateSlotName.Toolbar }, { name: TemplateSlotName.Body }],
    content: {
        [TemplateSlotName.Toolbar]: [
            button('feature-new', 'New', { severity: 'primary', icon: 'pi pi-plus' }),
            button('feature-export', 'Export', { severity: 'secondary', icon: 'pi pi-download' }),
        ],
    },
    displayName: 'Feature section',
    description: 'Feature level: fits a module workspace body slot and brings the action toolbar.',
};

/**
 * Slice level: fits the feature section's `body` slot.
 *
 * The end of the chain, and deliberately the thinnest thing in it - one behavior's surface, with somewhere
 * to put it and somewhere to put its actions.
 */
export const sliceSectionTemplate: ScreenTemplate = {
    name: 'SliceSection',
    fitsSlot: TemplateSlotName.Body,
    slots: [{ name: TemplateSlotName.Body }, { name: TemplateSlotName.Actions }],
    arrangement: {
        root: column([slotLeaf(TemplateSlotName.Body, { grow: 1 }), slotLeaf(TemplateSlotName.Actions)]),
    },
    content: {
        [TemplateSlotName.Body]: [externalComponent('slice-body', ComponentName.PageHeader, { title: 'Adjustment', subtitle: 'One behavior, one surface' })],
    },
    displayName: 'Slice section',
    description: 'Slice level: fits a feature section body slot and hosts one behavior.',
};

/** The chain, outermost first - what a spec walks to prove `fitsSlot` resolves at every level. */
export const nestingChainTemplates: ScreenTemplate[] = [moduleWorkspaceTemplate, featureSectionTemplate, sliceSectionTemplate];
