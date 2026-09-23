// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * An action a document asked for that this host cannot carry out.
 *
 * Kept as data rather than written straight to the console, so a surface can show it. A modelled button that
 * silently does nothing is the hardest kind of defect to trace back to its cause: nothing failed, so nothing
 * was reported, and the document looks correct because it is.
 */
export interface UnresolvedAction {
    /** Identifies the report for the lifetime of the surface showing it. */
    readonly id: number;

    /** What the document asked for, phrased as the document phrased it. */
    readonly action: string;
}
