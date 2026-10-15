// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * One field of the form a slice's command is submitted from.
 */
export interface SliceCommandField {
    /** The command property. */
    name: string;

    /** The property's type: `string`, `number`, `boolean`, `date`, `guid` ... Numbers and booleans are sent as such. */
    type: string;

    /** The label shown for the field; derived from the name when absent. */
    label?: string;

    /** Whether the field must have a value. */
    required?: boolean;

    /** The value the field starts with - a preview fills it from the active sample data pack; a running application leaves it out. */
    initialValue?: string | number | boolean;
}
