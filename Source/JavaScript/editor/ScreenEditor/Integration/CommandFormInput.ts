// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BindingExpression } from '@cratis/scene.model';

export interface CommandFormInput {
    property: string;
    type: 'string' | 'guid';
    label: string;
    column?: number;
    width?: string;
    value?: BindingExpression;
}
