// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ScreenTemplate, WidthSizeClass } from '@cratis/scene.model';
import { SlotName, TemplateSlotName, column, row, slotLeaf } from '@cratis/scene.blueprint.default';
import { filterPanel, objectContentEditor, objectNavigationalBar, schemaEditor, timeMachine } from './editorElements';
import { arcPageHeader, errorBoundary, page, toolbar, toolbarButton, toolbarSeparator } from './elements';
import { SampleBindingName } from './SampleBindingName';

/**
 * The two inspection pages: one for a type's shape, one for an instance's content.
 *
 * These are the templates to open first when looking at this blueprint, because they are the two that
 * render completely with nothing registered. The schema editor, the document editor, the navigational bar
 * and the time machine all read their content out of the property bag rather than from a query, so a
 * preview of either page is a working page rather than a page of placeholders.
 *
 * That is not a trick to make a demo look better. It is the honest shape of the library: most of
 * `@cratis/components` is Arc-bound and needs a host, and a meaningful part of it is not. A blueprint built
 * on it should make both halves visible.
 */

/**
 * The schema editor page: an event type's shape, edited as a typed property tree.
 *
 * Its header names no binding, and that is correct rather than an omission. A schema is design-time
 * metadata about an event type, not a read model anyone queries, so there is nothing for the header to be
 * bound to - and the header says `No binding` instead of implying a wiring step that does not exist. It is
 * the one page in this package where the unbound state is the finished state.
 *
 * `canEdit` is paired with `canNotEditReason` deliberately: in an event-sourced application a stored event
 * type's schema is very often deliberately locked, and saying why in the same place is what stops that
 * from reading as a bug.
 */
export const schemaEditorPageTemplate: ScreenTemplate = {
    name: 'SchemaEditorPage',
    fitsSlot: SlotName.Content,
    slots: [{ name: TemplateSlotName.Header }, { name: TemplateSlotName.Toolbar }, { name: TemplateSlotName.Body }],
    arrangement: {
        root: column([slotLeaf(TemplateSlotName.Header), slotLeaf(TemplateSlotName.Toolbar), slotLeaf(TemplateSlotName.Body, { grow: 1 })], 16),
    },
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('schema-header', {
                title: 'InvoiceRegistered',
                subtitle: 'The shape of the event, and what a new generation would be allowed to change',
                section: 'Event types',
            }),
        ],
        [TemplateSlotName.Toolbar]: [
            toolbar('schema-toolbar', [
                toolbarButton('schema-edit', 'Edit the schema', 'pi pi-pencil', 'Edit'),
                toolbarButton('schema-generation', 'Start a new generation', 'pi pi-clone', 'New generation'),
                toolbarSeparator('schema-separator'),
                toolbarButton('schema-download', 'Download as JSON Schema', 'pi pi-download'),
            ]),
        ],
        [TemplateSlotName.Body]: [
            page('schema-body', 'InvoiceRegistered', [schemaEditor('schema-editor', 'InvoiceRegistered', true)]),
        ],
    },
    displayName: 'Schema editor page',
    description: "An event type's schema edited as a typed property tree, with the actions that evolve it.",
};

/**
 * The object editor page: one document, its trail, and its history beside it.
 *
 * Bound to `InvoiceById`, because that is what a real page like this is: you arrive with an id, the query
 * fetches the record, and the editor renders it against its schema. The editors themselves take their
 * content from the property bag, so the page is fully legible before the query is wired - and the header
 * still says which query it is waiting for.
 *
 * The document is wrapped in an `errorBoundary` and the history is not, which is the decision this element
 * exists to let a template make. A malformed document should cost the document region; it should not take
 * the trail and the timeline down with it, and the timeline is the thing you would reach for to find out
 * *when* the document became malformed.
 */
export const objectEditorPageTemplate: ScreenTemplate = {
    name: 'ObjectEditorPage',
    fitsSlot: SlotName.Content,
    slots: [
        { name: TemplateSlotName.Header },
        { name: TemplateSlotName.Toolbar },
        { name: TemplateSlotName.Body },
        { name: TemplateSlotName.SidePanel },
    ],
    arrangement: {
        root: column([
            slotLeaf(TemplateSlotName.Header),
            slotLeaf(TemplateSlotName.Toolbar),
            row([slotLeaf(TemplateSlotName.Body, { grow: 2 }), slotLeaf(TemplateSlotName.SidePanel, { grow: 1 })], 16),
        ]),
        overrides: [
            {
                width: WidthSizeClass.Compact,
                root: column(
                    [
                        slotLeaf(TemplateSlotName.Header),
                        slotLeaf(TemplateSlotName.Toolbar),
                        slotLeaf(TemplateSlotName.Body),
                        slotLeaf(TemplateSlotName.SidePanel),
                    ],
                    16,
                ),
            },
        ],
    },
    content: {
        [TemplateSlotName.Header]: [
            arcPageHeader('object-header', {
                title: 'INV-2043',
                subtitle: 'The document as it stands, and every version it has been',
                section: 'Billing',
                query: SampleBindingName.InvoiceById,
            }),
        ],
        [TemplateSlotName.Toolbar]: [objectNavigationalBar('object-trail'), filterPanel('object-filters', 'Filters')],
        [TemplateSlotName.Body]: [
            errorBoundary('object-guard', [page('object-body', 'Document', [objectContentEditor('object-editor', true)])]),
        ],
        [TemplateSlotName.SidePanel]: [page('object-history', 'History', [timeMachine('object-time-machine')])],
    },
    displayName: 'Object editor page',
    description: 'One document edited against its schema, with its navigation trail and its version history.',
};

/** The two editor-shaped templates. */
export const editorTemplates: ScreenTemplate[] = [schemaEditorPageTemplate, objectEditorPageTemplate];
