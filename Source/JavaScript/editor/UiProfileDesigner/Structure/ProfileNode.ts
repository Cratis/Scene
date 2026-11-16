// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProfileNodeKind } from './ProfileNodeKind';

// One node of the profile's structure tree.
export interface ProfileNode {
    id: string;
    kind: ProfileNodeKind;
    name: string;

    // The current choice, shown after the name: the shell's name, the theme and colour scheme, the number of packages.
    detail?: string;

    // How many problems this node owns; drawn as a badge on the node.
    problems: number;
    children: ProfileNode[];
}
