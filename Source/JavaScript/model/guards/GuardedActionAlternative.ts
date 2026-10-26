// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardCondition } from './GuardCondition';
import { SubjectReference } from './SubjectReference';

export interface GuardedActionAlternative {
    command: string;
    condition: GuardCondition;
    arguments?: Record<string, SubjectReference>;
}

export const GuardedActionAlternativePropertyNames: (keyof GuardedActionAlternative)[] = ['command', 'condition', 'arguments'];
