// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { FormField } from '@cratis/scene.model';
import type { StateChangeSlice } from '../Actions/StateChangeSlice';

// Where a field's value, and what is asked of it, comes from.
export enum FieldMarkerKind {
    // The field fills a property of the command.
    BoundToCommand = 'boundToCommand',

    // The field is required because the command's rules require the property it fills.
    InheritedFromRules = 'inheritedFromRules',

    // The field is the form's own: nothing on the command fills it, or a callback computes it.
    Local = 'local',
}

// The markers a field carries: what it fills on the command, what the command's rules ask of it, or that its value is only the form's.
export function fieldMarkersOf(field: FormField, slice: StateChangeSlice | undefined): FieldMarkerKind[] {
    if (field.composeUsing) return [FieldMarkerKind.Local];
    const input = slice?.inputs.find(candidate => candidate.name === (field.sourceProperty ?? field.name));
    if (!input) return [FieldMarkerKind.Local];
    return input.required ? [FieldMarkerKind.BoundToCommand, FieldMarkerKind.InheritedFromRules] : [FieldMarkerKind.BoundToCommand];
}
