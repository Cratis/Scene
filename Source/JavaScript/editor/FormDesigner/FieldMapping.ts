// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormField } from '@cratis/scene.model';
import { FieldMappingKind } from './FieldMappingKind';

/**
 * A {@link FormField} together with the {@link FieldMappingKind} it classifies as - see `classifyFormFields`.
 */
export interface FieldMapping {
    field: FormField;
    kind: FieldMappingKind;
}
