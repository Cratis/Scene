// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a `reference` editor offers: the model elements of one kind, narrowed by a named rule.
 */
export interface ReferenceFilterDescriptor {
    /** The kind of model element referenced: `screen`, `slice`, `template`, `shape`, `field` ... A host maps it to what it can list. */
    target: string;

    /** Narrows the target to these kinds (a slice is a `StateChange`, a `ReadModel` ...). Absent means every kind. */
    kinds?: string[];

    /** Names the rule that decides which candidates are offered, interpreted by the host - like `availability` of a design-time action. */
    predicate?: string;
}

/**
 * The parameters of a named editor, alongside `PropertyDescriptor.editorKind`: the bits a generic editor needs that are not a value
 * constraint. Every field is optional and only the ones an editor documents are read.
 */
export interface PropertyEditorOptions {
    /** `text`: a multi-line box instead of a single line. */
    multiline?: boolean;

    /** `text`: the hint shown while empty. */
    placeholder?: string;

    /** `number`: the unit shown after the value (`px`, `%`, `ms`). */
    unit?: string;

    /** `number`: the increment of a stepper. The range is `constraints.minimum` and `constraints.maximum`. */
    step?: number;

    /** `slice`: the slice kinds that can be chosen (`['StateChange']`); others are listed disabled with a reason. */
    kinds?: string[];

    /** `reference`: what can be referenced. Required by the `reference` editor. */
    reference?: ReferenceFilterDescriptor;

    /** `field`: the kinds of field offered (`string`, `number`, `boolean` ...). Absent means any. */
    fieldKinds?: string[];

    /** `color`: only theme tokens, no custom colour. */
    tokensOnly?: boolean;
}

export const ReferenceFilterDescriptorPropertyNames: (keyof ReferenceFilterDescriptor)[] = ['target', 'kinds', 'predicate'];
export const PropertyEditorOptionsPropertyNames: (keyof PropertyEditorOptions)[] = [
    'multiline', 'placeholder', 'unit', 'step', 'kinds', 'reference', 'fieldKinds', 'tokensOnly',
];
