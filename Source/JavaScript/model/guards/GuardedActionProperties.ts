// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from '../common';
import { GuardedActionAlternative } from './GuardedActionAlternative';
import { GuardedActionFallback } from './GuardedActionFallback';

export const GuardedActionComponentName = 'core:guarded-action';

export interface GuardedActionProperties {
    label: string;
    alternatives: GuardedActionAlternative[];
    item?: BindingExpression;
    otherwise?: GuardedActionFallback;
    navigateToScreen?: string;
    navigateByParameter?: string;
}

export const GuardedActionPropertiesPropertyNames: (keyof GuardedActionProperties)[] = [
    'label', 'alternatives', 'item', 'otherwise', 'navigateToScreen', 'navigateByParameter',
];
