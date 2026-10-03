// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SafeNode } from './SafeNode';

/** An element of authored HTML that the allowlist kept, with only the attributes the allowlist kept. */
export interface SafeElement {
    /** A tag from the allowlist, lower case. */
    tag: string;

    /** The kept attributes, already validated. */
    attributes: Record<string, string>;

    children: SafeNode[];
}
