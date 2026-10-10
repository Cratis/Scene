// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Identifies one run of a bound query, issued when the run starts. */
export interface QueryBindingTicket {
    query: string;
    generation: number;
}
