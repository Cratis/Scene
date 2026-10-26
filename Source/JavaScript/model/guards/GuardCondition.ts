// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComparisonGuardCondition } from './ComparisonGuardCondition';
import { LogicalGuardCondition } from './LogicalGuardCondition';

export type GuardCondition = ComparisonGuardCondition | LogicalGuardCondition;
