// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The three population tiers a {@link FormField} can be in, plus the designer-only `Broken` state for a
 * field whose source property no longer exists on the command - part of StudioIssues#157, surfacing the
 * compiler's rename-breaks-the-build guarantee visually instead of only failing at build time.
 */
export enum FieldMappingKind {
    /** `sourceProperty` and `composeUsing` are both unset - the field maps to a command property of the same name. */
    AutoMapped = 'autoMapped',

    /** `sourceProperty` is set - the field maps to a differently-named command property. */
    Renamed = 'renamed',

    /** `composeUsing` is set - the field's value is computed by a callback. */
    Composed = 'composed',

    /** The field's source property (its own name, or `sourceProperty` when renamed) does not exist on the command. */
    Broken = 'broken',
}
