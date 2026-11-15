// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isOrderedItemCollection } from '../../Collections/orderedItemShape';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { OrderedItemsEditor } from './OrderedItemsEditor';
import { StructuredPropertyEditor } from './StructuredPropertyEditor';

// A collection: the ordered-item editor for the things an author lists and orders - navigation items, edited through Scene's collection
// operations - and the structured editor for records with fields of their own.
export const CollectionEditor = (props: PropertyEditorProps<unknown>) =>
    isOrderedItemCollection(props.descriptor) && props.context.session ? <OrderedItemsEditor {...props} /> : <StructuredPropertyEditor {...props} />;
