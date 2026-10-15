// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Binds one specific pack to one read model or shape, overriding the application's active pack.
 */
export interface SampleDataBinding {
    /** The read model or shape name the binding applies to. */
    target: string;

    /** The identity of the bound pack. */
    pack: string;
}

export const SampleDataBindingPropertyNames: (keyof SampleDataBinding)[] = ['target', 'pack'];
