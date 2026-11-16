// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The forms PrimeReact 11 gives a Button through its `variant` prop.
 *
 * A union rather than an enum for the reason `PrimeSeverity` is one: the value is handed straight to a PrimeReact prop whose own type is a
 * string-literal union.
 */
export type PrimeButtonForm = 'outlined' | 'text' | 'link';
