// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One allowed value of an `Enum` property.
 */
export interface PropertyChoice {
    value: string | number;
    label: string;
    description?: string;
}

export const PropertyChoicePropertyNames: (keyof PropertyChoice)[] = ['value', 'label', 'description'];
