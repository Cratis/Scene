// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PrimeSeverity } from '../PrimeSeverity';
import { PrimeButtonForm } from './PrimeButtonForm';

/** The look of a Button in PrimeReact's own vocabulary: the severity it is tinted with and the form it takes. */
export interface ButtonLook {
    /** The severity, absent for `primary`, which is PrimeReact's default. */
    severity?: PrimeSeverity;

    /** The form, absent for a filled button. */
    variant?: PrimeButtonForm;
}
