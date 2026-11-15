// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ProfileNodeKind } from '../Structure/ProfileNodeKind';

// One finding about the profile: the node that owns it, a stable code and the sentence a person reads. Messages carry real names, never ids.
export interface ProfileProblem {
    code: string;
    severity: 'error' | 'warning';
    message: string;
    node: ProfileNodeKind;

    // The property the finding is about, when it is about one; the field shows it inline.
    property?: string;
}
