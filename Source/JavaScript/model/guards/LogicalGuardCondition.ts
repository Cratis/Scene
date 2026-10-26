// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardCondition } from './GuardCondition';
import { LogicalGuardOperator } from './LogicalGuardOperator';

export interface LogicalGuardCondition {
    kind: 'logical';
    left: GuardCondition;
    operator: LogicalGuardOperator;
    right: GuardCondition;
}

export const LogicalGuardConditionPropertyNames: (keyof LogicalGuardCondition)[] = ['left', 'operator', 'right'];
