// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingSourceKind } from '@cratis/scene.model';
import type { BindingSourceChoice } from './BindingSourceChoice';
import type { BindingSourceChoiceInputs } from './BindingSourceChoiceInputs';

export function bindingSourceChoices(inputs: BindingSourceChoiceInputs): BindingSourceChoice[] {
    return [
        { kind: BindingSourceKind.DataContext, label: 'Data context' },
        { kind: BindingSourceKind.QueryResult, label: 'Query result', disabled: inputs.queryResults.length === 0 },
        { kind: BindingSourceKind.ComponentProperty, label: 'Component property', disabled: inputs.componentOutputs.length === 0 },
        { kind: BindingSourceKind.Literal, label: 'Literal value' },
    ];
}
