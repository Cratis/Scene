// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { externalComponent } from '@cratis/scene.blueprint.default';
import { CompositeName } from '../CompositeName';
import { invoiceDocument, invoiceFilters, invoiceNavigationPath, invoiceSchema, invoiceVersions } from './sampleData';

/**
 * The Arc-free editing and inspection elements this blueprint's templates are built from.
 *
 * Unlike everything else in this package these need no binding at all - they take their content straight
 * out of the property bag - so a template built from them renders as a working page with no host, no
 * proxies and no backend. That is what makes the editor templates the ones to open first when looking at
 * this blueprint.
 */

/**
 * A JSON schema edited as a typed property tree rather than as text.
 *
 * `canEdit` and `canNotEditReason` belong together: in an event-sourced application a schema is very often
 * deliberately read-only, and saying *why* in the same place is what keeps that from looking like a bug.
 */
export function schemaEditor(id: string, eventTypeName: string, canEdit: boolean, canNotEditReason?: string): SceneElement {
    return externalComponent(id, CompositeName.SchemaEditor, {
        schema: invoiceSchema,
        eventTypeName,
        canEdit,
        canNotEditReason,
        editMode: canEdit,
    });
}

/** A document rendered against its schema, so nested values are navigable and each is edited by its declared type. */
export function objectContentEditor(id: string, editMode: boolean): SceneElement {
    return externalComponent(id, CompositeName.ObjectContentEditor, { object: invoiceDocument, schema: invoiceSchema, editMode });
}

/** The trail saying where you are inside a nested document, and the way back out. */
export function objectNavigationalBar(id: string): SceneElement {
    return externalComponent(id, CompositeName.ObjectNavigationalBar, { navigationPath: invoiceNavigationPath });
}

/**
 * The timeline of successive versions.
 *
 * Worth a place on a detail page in a way it would not be in a CRUD application: in an event-sourced
 * system everything *has* a history rather than only a current value, so scrubbing through it is the
 * natural way to look at a record rather than a special feature.
 */
export function timeMachine(id: string): SceneElement {
    return externalComponent(id, CompositeName.TimeMachine, { versions: invoiceVersions, currentVersionIndex: 0 });
}

/**
 * The filter toggle and the panel it anchors, as one element.
 *
 * One element rather than two because `FilterPanel` is a portal anchored to a button - it renders next to
 * whatever opened it, so it cannot be placed on its own, and the element tree has no way to express an
 * anchor relationship. The adapter owns both halves, and a template places one thing.
 */
export function filterPanel(id: string, label: string): SceneElement {
    return externalComponent(id, CompositeName.FilterPanel, { label, filters: invoiceFilters, searchPlaceholder: 'Search filters' });
}

/** A standalone selection control, not bound to a command property. */
export function dropdown(id: string, placeholder: string, options: { label: string; value: string }[]): SceneElement {
    return externalComponent(id, CompositeName.Dropdown, { placeholder, options, showClear: true });
}
