// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingMode, BindingSourceKind } from '../common';
import { CollectionItemDescriptor } from './CollectionItemDescriptor';
import { PropertyChoice } from './PropertyChoice';
import { PropertyConstraints } from './PropertyConstraints';
import { PropertyValueType } from './PropertyValueType';

/**
 * Describes one editable property of a node: where it lives, what it is called, what it may hold and how a host
 * should edit it. A descriptor is plain data, so packages ship them and Studio reads them without loading a
 * component.
 */
export interface PropertyDescriptor {
    /**
     * Where the value lives. For an `ExternalComponent` it is a key (or dotted key path) in the element's
     * `properties` bag; for a model-native node such as a flow container it is the node's own property name.
     */
    path: string;

    /** The label an editor shows. */
    label: string;

    /** The editor section the property belongs to. */
    group: string;

    valueType: PropertyValueType;

    /** The allowed values of an `Enum` property. */
    choices?: PropertyChoice[];

    /** The value in effect when none is set. */
    default?: unknown;

    constraints?: PropertyConstraints;

    /**
     * Names a specialised editor. A host maps the name to its own editor - an icon picker, a query binder - and
     * falls back to the default editor for `valueType` when it does not know the name.
     */
    editorKind?: string;

    /** A sentence of help for the editor. */
    description?: string;

    /** Describes the items of a `Collection` property. Required when `valueType` is `Collection`. */
    item?: CollectionItemDescriptor;

    /** The value is shown but never edited. */
    readOnly?: boolean;

    /** This property is emitted by the component and may be bound by other elements. */
    output?: boolean;

    /** Which binding source kinds may be assigned to this property. */
    acceptedBindingKinds?: BindingSourceKind[];

    /** The strongest binding mode the property supports. */
    bindingMode?: BindingMode;
}

export const PropertyDescriptorPropertyNames: (keyof PropertyDescriptor)[] = [
    'path', 'label', 'group', 'valueType', 'choices', 'default', 'constraints', 'editorKind', 'description', 'item', 'readOnly',
    'output', 'acceptedBindingKinds', 'bindingMode',
];
