// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    CollectionOperation, ComponentDescriptor, EditingScope, EditingScopeKind, ExternalComponent, FlowContainerKind,
    HorizontalAlignment, Layout, PropertyValueType, QueryResultShape, SceneDocument, ScreenTemplate, Screen,
    VerticalAlignment, Visibility,
} from '@cratis/scene.model';
import { createDescriptorCatalog, EditingContext } from '../../index';

export function component(id: string, componentName: string, properties: Record<string, unknown> = {}, slots: ExternalComponent['slots'] = {}): ExternalComponent {
    return {
        id, name: id, componentName, properties, slots,
        visibility: Visibility.Visible, isEnabled: true, opacity: 1, size: {}, zIndex: 0, minimumSize: {}, maximumSize: {},
        margin: { left: 0, top: 0, right: 0, bottom: 0 },
        horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch,
    };
}

/** A navigation bar with a fixed Home item and a collection consumers can extend, like the real one. */
export const navigationBarDescriptor: ComponentDescriptor = {
    component: 'test:navigationBar',
    displayName: 'Navigation bar',
    properties: [
        {
            path: 'items', label: 'Items', group: 'Content', valueType: PropertyValueType.Collection,
            item: {
                label: 'Item',
                properties: [
                    { path: 'label', label: 'Label', group: 'Content', valueType: PropertyValueType.String, constraints: { required: true } },
                    { path: 'icon', label: 'Icon', group: 'Content', valueType: PropertyValueType.Icon, editorKind: 'iconPicker' },
                    { path: 'destination', label: 'Destination', group: 'Content', valueType: PropertyValueType.Destination },
                ],
            },
            constraints: { maximumItems: 6 },
        },
        { path: 'title', label: 'Title', group: 'Content', valueType: PropertyValueType.String, default: 'Menu' },
        { path: 'density', label: 'Density', group: 'Look', valueType: PropertyValueType.Enum, choices: [{ value: 'compact', label: 'Compact' }, { value: 'roomy', label: 'Roomy' }] },
    ],
};

export const tableDescriptor: ComponentDescriptor = {
    component: 'test:table',
    properties: [
        { path: 'query', label: 'Query', group: 'Data', valueType: PropertyValueType.QueryReference, editorKind: 'queryBinding', constraints: { resultShapes: [QueryResultShape.Collection] } },
        { path: 'pageSize', label: 'Page size', group: 'Data', valueType: PropertyValueType.Number, constraints: { minimum: 1, maximum: 100, integer: true } },
        { path: 'locked', label: 'Locked', group: 'Data', valueType: PropertyValueType.String, readOnly: true },
    ],
};

export const homeItem = { id: 'home', label: 'Home', destination: { screen: 'Home' } };

export const shell: Layout = { name: 'Shell', slots: [{ name: 'header' }, { name: 'content' }] };

/**
 * Two nested templates and two screens: `Module` (with a navigation bar) fits the shell, `Feature` fits `Module`'s
 * body, and both `Invoices` and `Customers` fill `Feature`.
 */
export function createSceneDocument(): SceneDocument {
    const module: ScreenTemplate = {
        name: 'Module',
        fitsSlot: 'content',
        slots: [{ name: 'chrome' }, { name: 'body' }],
        content: { chrome: [component('navbar', 'test:navigationBar', { items: [homeItem] })], body: [] },
    };
    const feature: ScreenTemplate = {
        name: 'Feature',
        fitsSlot: 'Module.body',
        slots: [{ name: 'main' }],
        content: {
            main: [],
        },
        arrangement: {
            root: {
                kind: FlowContainerKind.Column, gap: 8, grow: 1,
                children: [
                    { kind: FlowContainerKind.Row, gap: 4, children: [{ slotName: 'main' }] },
                ],
            },
        } as ScreenTemplate['arrangement'],
    };
    const invoices: Screen = {
        name: 'Invoices', layout: 'Shell', screenTemplate: 'Feature', forms: [], contributions: [],
        slotContent: { main: [component('invoiceTable', 'test:table', { pageSize: 25 })] },
    };
    const customers: Screen = {
        name: 'Customers', layout: 'Shell', screenTemplate: 'Feature', forms: [], contributions: [],
        slotContent: { main: [component('customerTable', 'test:table')] },
    };

    return {
        layouts: [shell],
        screenTemplates: [module, feature],
        dialogTemplates: [],
        screens: [invoices, customers],
        exposures: [],
        instanceContributions: [],
    };
}

/** The same document with `Module` exposing the navigation bar's items and title to what sits inside it. */
export function createExposedDocument(): SceneDocument {
    const document = createSceneDocument();
    document.exposures.push({
        owner: 'Module',
        properties: [
            { component: 'navbar', path: 'items', operations: [CollectionOperation.Add, CollectionOperation.Remove, CollectionOperation.Reorder, CollectionOperation.EditFields], editableFields: ['label', 'icon', 'destination'] },
            { component: 'navbar', path: 'title' },
        ],
    });
    return document;
}

/** The same document with `Feature` re-exposing what `Module` exposed, so screens reach it. */
export function createReExposedDocument(): SceneDocument {
    const document = createExposedDocument();
    document.exposures.push({
        owner: 'Feature',
        properties: [
            { component: 'navbar', path: 'items', reExposes: 'Module', operations: [CollectionOperation.Add, CollectionOperation.EditFields] },
            { component: 'navbar', path: 'title', reExposes: 'Module' },
        ],
    });
    return document;
}

export const catalog = createDescriptorCatalog([navigationBarDescriptor, tableDescriptor]);

export function scopeOf(kind: EditingScopeKind, name: string, layout?: string): EditingScope {
    return { kind, name, layout };
}

export function contextFor(kind: EditingScopeKind, name: string, extra: Partial<EditingContext> = {}): EditingContext {
    return { catalog, scope: scopeOf(kind, name, 'Shell'), ...extra };
}
