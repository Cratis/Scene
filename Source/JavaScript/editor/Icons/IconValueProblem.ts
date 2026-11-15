// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconDiagnostic } from '@cratis/scene.engine';
import { IconReference } from '@cratis/scene.model';

// What is wrong with the icon a field holds.
export interface IconValueProblem {
    reference: IconReference;

    diagnostic?: IconDiagnostic;

    isNotAllowed: boolean;
}
