// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionOperation, SceneEditKind, type ExposedProperty, type ExposePropertyEdit, type SceneDocument, type UnexposePropertyEdit } from '@cratis/scene.model';

// What a template author decides when exposing a property: whether it can be changed, or - for a collection - how.
export interface ExposureChoice {
    label?: string;
    operations?: CollectionOperation[];
    editableFields?: string[];
}

// Exposes a property of a component in the template being authored, so the scopes that use the template can configure it.
export function exposePropertyEdit(templateName: string, componentId: string, path: string, choice: ExposureChoice = {}): ExposePropertyEdit {
    const property: ExposedProperty = {
        component: componentId,
        path,
        ...(choice.label ? { label: choice.label } : {}),
        ...(choice.operations && choice.operations.length > 0 ? { operations: choice.operations } : {}),
        ...(choice.editableFields && choice.editableFields.length > 0 ? { editableFields: choice.editableFields } : {}),
    };
    return { kind: SceneEditKind.ExposeProperty, owner: templateName, property };
}

export function unexposePropertyEdit(templateName: string, componentId: string, path: string): UnexposePropertyEdit {
    return { kind: SceneEditKind.UnexposeProperty, owner: templateName, component: componentId, path };
}

// Whether a template exposes a property, read from the document's exposures. While a template is being authored its own
// properties are plain editable properties, so inspection cannot say they are exposed - the exposure list can.
export const isExposed = (document: SceneDocument, templateName: string, componentId: string, path: string): boolean =>
    document.exposures.some(declaration => declaration.owner === templateName
        && declaration.properties.some(exposed => exposed.component === componentId && exposed.path === path));

// The operations an exposed collection allows by default: adding, removing and reordering the scopes' own items, and editing their fields.
export const defaultCollectionOperations: CollectionOperation[] = [CollectionOperation.Add, CollectionOperation.Remove, CollectionOperation.Reorder, CollectionOperation.EditFields];
