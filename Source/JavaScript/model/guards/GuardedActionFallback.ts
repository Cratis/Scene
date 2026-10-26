// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardedActionFallbackOutcome } from './GuardedActionFallbackOutcome';
import { SubjectReference } from './SubjectReference';

export interface GuardedActionFallback {
    outcome: GuardedActionFallbackOutcome;
    command?: string;
    arguments?: Record<string, SubjectReference>;
}

export const GuardedActionFallbackPropertyNames: (keyof GuardedActionFallback)[] = ['outcome', 'command', 'arguments'];
