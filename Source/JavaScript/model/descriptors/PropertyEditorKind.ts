// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The editor ids Studio's property-editor registry resolves (spec section 8). A property names one in `editorKind`; a host that
 * does not know the id falls back to the default editor for `valueType`, and a package may name ids of its own (they are strings).
 * This vocabulary defines only the ids and, in {@link PropertyEditorOptions}, their parameters - the editors themselves belong to the host.
 *
 * It starts with the editors for values that have no fields to describe, so a host can edit them without asking for JSON text.
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

    /** A single line of text; `editorOptions.multiline` makes it a box, `editorOptions.placeholder` hints it. */
    Text: 'text',

    /** A number; `constraints.minimum`/`maximum` and `editorOptions.step`/`unit` shape it. */
    Number: 'number',

    /** A switch with a label. */
    Boolean: 'boolean',

    /** Up to four choices as segmented chips. */
    Enum: 'enum',

    /** Any number of choices as a dropdown with a filter. */
    Select: 'select',

    /** A theme token first, a custom colour second. */
    Color: 'color',

    /** An icon from a searchable grid. */
    Icon: 'icon',

    /** A list of simple items: add, remove, reorder rows. */
    List: 'list',

    /** The id of another model element, from a searchable dropdown restricted by `editorOptions.reference`. */
    Reference: 'reference',

    /** The target of a navigation item: a Module > Feature tree, shown as a breadcrumb when closed. */
    NavigationTarget: 'navigationTarget',

    /** One of the slots of the effective template, with a mini diagram of its position. */
    RenderingSlot: 'renderingSlot',

    /** A slice from the slice tree; `editorOptions.kinds` (for example `['StateChange']`) filters, the rest are listed disabled with a reason. */
    Slice: 'slice',

    /** How a region relates to what it inherits: `inherit`, `extend` or `override`, as a three-way control. */
    InheritanceMode: 'inheritanceMode',

    /** A reference to a template, chosen through the template picker. */
    Template: 'template',

    /** A reference to a sample data pack. */
    SampleData: 'sampleData',

    /** A field of the shape a component is bound to, typed by `editorOptions.fieldKinds`. */
    Field: 'field',

    /** The columns of a table: rows of `{ field, header, width, align, format }`. */
    ColumnList: 'columnList',
} as const;

export type PropertyEditorKind = (typeof PropertyEditorKind)[keyof typeof PropertyEditorKind];
