// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardCondition } from '../guards';
import { InteractionAction } from './InteractionAction';

export interface InteractionAlternative {
    condition: GuardCondition;
    actions: InteractionAction[];
}

export const InteractionAlternativePropertyNames: (keyof InteractionAlternative)[] = ['condition', 'actions'];
