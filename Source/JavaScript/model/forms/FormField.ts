// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One field of a {@link Form}. Mirrors the three population tiers Screenplay's `form` construct
 * establishes: auto-mapped by name (`sourceProperty` and `composeUsing` both undefined), explicitly
 * renamed (`sourceProperty` set), or computed by a callback (`composeUsing` set).
 */
export interface FormField {
    name: string;
    sourceProperty?: string;
    composeUsing?: string;
    label?: string;
}

export const FormFieldPropertyNames: (keyof FormField)[] = ['name', 'sourceProperty', 'composeUsing', 'label'];
