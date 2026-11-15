// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PropertyValueType, type PropertyDescriptor } from '@cratis/scene.model';

// What the ordered-item editor can edit of an item: the fields of a navigation entry.
const orderedItemFields = new Set(['label', 'icon', 'destination']);

// Whether a collection is a list of things an author lists and orders - navigation items - which the ordered-item editor draws, rather
// than records with fields of their own, which the structured editor draws. Items whose fields are all the ordered-item editor's own
// (or that describe none) are the former.
export const isOrderedItemCollection = (descriptor: PropertyDescriptor): boolean =>
    descriptor.valueType === PropertyValueType.Collection && descriptor.item !== undefined && descriptor.item.properties.every(field => orderedItemFields.has(field.path));
