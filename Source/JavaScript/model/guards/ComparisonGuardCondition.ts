// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { GuardOperator } from './GuardOperator';
import { SubjectReference } from './SubjectReference';

export interface ComparisonGuardCondition {
    kind: 'comparison';
    left: SubjectReference;
    operator: GuardOperator;
    right: string | number | boolean | null;
    enumeration?: string[];
}

export const ComparisonGuardConditionPropertyNames: (keyof ComparisonGuardCondition)[] = ['left', 'operator', 'right', 'enumeration'];
