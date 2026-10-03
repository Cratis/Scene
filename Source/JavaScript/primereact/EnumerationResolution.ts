// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** The outcome of resolving an authored enumeration value: the member, or the reason none could be chosen. */
export type EnumerationResolution<TMember extends string> =
    | { isValid: true; value: TMember }
    | { isValid: false; value: unknown; message: string };
