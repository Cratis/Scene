// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The kind of value a property holds. It decides what a value must look like to be accepted, and gives a host a
 * default editor to show - unless the descriptor names a specialised `editorKind`.
 */
export enum PropertyValueType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',

    /** One of the descriptor's `choices`. */
    Enum = 'enum',

    /** An {@link IconReference}. The icon catalog is owned by the icon libraries, not by the model. */
    Icon = 'icon',

    /** A {@link DestinationReference}. */
    Destination = 'destination',

    /** A {@link QueryBinding}. */
    QueryReference = 'queryReference',

    /** An ordered list of items, each described by the descriptor's `item`. */
    Collection = 'collection',

    /** A structured value the descriptor's own `editorKind` knows how to edit. */
    Object = 'object',
}
