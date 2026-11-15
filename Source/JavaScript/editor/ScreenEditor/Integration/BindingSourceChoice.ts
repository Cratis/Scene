// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BindingSourceKind } from '@cratis/scene.model';

export interface BindingSourceChoice {
    kind: BindingSourceKind;
    label: string;
    disabled?: boolean;
}
