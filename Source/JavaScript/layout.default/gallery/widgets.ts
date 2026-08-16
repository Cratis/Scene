// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneElement } from '@cratis/scene.model';
import { ComponentName } from '../ComponentName';
import { button, card, externalComponent, panel, text } from './elements';

/**
 * The repeated pieces the gallery's screen templates are built from.
 *
 * The gallery only earns its place if a preview shows something that looks like an application - a
 * dashboard with four stat cards over two columns of larger widgets, a list with real columns and real
 * rows. Seeded content that says "Lorem ipsum" proves the renderer runs and nothing else. These builders
 * are what keep twenty templates' worth of realistic content from becoming twenty pages of literals.
 */

/** A screen's title, subtitle and actions - the furniture every template starts with. */
export function pageHeader(id: string, title: string, subtitle: string, actions: SceneElement[] = []): SceneElement {
    return externalComponent(id, ComponentName.PageHeader, { title, subtitle }, { actions });
}

/**
 * One of the four figures across the top of a dashboard - the composition Sakai's dashboard opens with,
 * and the one every template in the line has copied since.
 */
export function statCard(id: string, label: string, value: string, delta: string, icon: string): SceneElement {
    return card(id, [text(`${id}-label`, label), text(`${id}-value`, value), text(`${id}-delta`, delta)], { icon, variant: 'stat' });
}

/** A titled surface holding a widget's content. */
export function widget(id: string, title: string, content: SceneElement[]): SceneElement {
    return card(id, [text(`${id}-title`, title), ...content], { title });
}

/** A table with real columns and real rows, so a list template looks like a list. */
export function table(id: string, columns: { field: string; header: string }[], rows: Record<string, unknown>[]): SceneElement {
    return externalComponent(
        id,
        'dataTable',
        { value: rows, dataKey: columns[0]?.field ?? 'id', paginator: rows.length > 8, rows: 8 },
        { columns: columns.map(column => externalComponent(`${id}-${column.field}`, 'column', { field: column.field, header: column.header, sortable: true })) },
    );
}

/** One labeled input in a form template. */
export function field(id: string, label: string, componentName: string, properties: Record<string, unknown> = {}): SceneElement {
    return panel(id, [text(`${id}-label`, label), externalComponent(`${id}-input`, componentName, properties)]);
}

/** A row of buttons closing a form. */
export function formActions(id: string, confirmLabel: string, cancelLabel = 'Cancel'): SceneElement {
    return panel(id, [button(`${id}-confirm`, confirmLabel, { severity: 'primary' }), button(`${id}-cancel`, cancelLabel, { severity: 'secondary' })]);
}

/** The empty state a list shows before anything exists - the designed one, never a build-time apology. */
export function emptyState(id: string, title: string, message: string, actionLabel: string): SceneElement {
    return card(id, [
        externalComponent(`${id}-icon`, 'image', { alt: title }),
        text(`${id}-title`, title),
        text(`${id}-message`, message),
        button(`${id}-action`, actionLabel, { severity: 'primary' }),
    ]);
}
