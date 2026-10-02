// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProvenanceKind } from './ProvenanceKind';

/**
 * Whether a node is the editing scope's own or comes from further out, and from where.
 */
export interface NodeProvenance {
    kind: `${ProvenanceKind}`;

    /** For an inherited node: the name of the layout or template that owns it. */
    source?: string;
}

export const NodeProvenancePropertyNames: (keyof NodeProvenance)[] = ['kind', 'source'];
