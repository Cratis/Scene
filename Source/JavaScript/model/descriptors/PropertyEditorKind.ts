// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The editor kinds for values that have no fields to describe, so a host can edit them without asking for JSON text.
 *
 * A list of plain values is a `json` property - Scene keeps the array exactly as authored - whose `editorKind` says what
 * its entries are. A record whose keys are the author's own (a row of data, keyed by column) is an `object` property
 * with no `properties` and the `stringMap` kind. A host that does not know a kind falls back to its default editor.
 */
export const PropertyEditorKind = {
    /** An ordered list of words. */
    StringList: 'stringList',

    /** An ordered list of numbers. */
    NumberList: 'numberList',

    /** One word, or an ordered list of words: a chart colour is one colour for the series or one for each point. */
    StringOrList: 'stringOrList',

    /** One word, number or flag - a value whose type the author chooses, such as the selected value of a control whose options carry any of them. */
    Scalar: 'scalar',

    /** A record of words, numbers and flags under names the author chooses. */
    StringMap: 'stringMap',
} as const;

export type PropertyEditorKind = (typeof PropertyEditorKind)[keyof typeof PropertyEditorKind];
