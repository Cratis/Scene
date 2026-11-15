// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Form, FormField } from '@cratis/scene.model';
import { FieldMapping } from './FieldMapping';
import { FieldMappingKind } from './FieldMappingKind';

/**
 * Classifies every field of a {@link Form} into its {@link FieldMappingKind} - part of StudioIssues#157's
 * field mapping UI. `commandProperties` is the set of property names the form's `forCommand` actually
 * declares (from the generated command proxy or the compiled Screenplay AST); this function does not fetch
 * it, so the designer stays free to source that list however it has it in scope.
 *
 * @param form The {@link Form} whose fields to classify.
 * @param commandProperties The property names declared on the form's target command.
 * @returns One {@link FieldMapping} per field, in the form's own field order.
 */
export function classifyFormFields(form: Form, commandProperties: readonly string[]): FieldMapping[] {
    return form.fields.map(field => ({ field, kind: classify(field, commandProperties) }));
}

function classify(field: FormField, commandProperties: readonly string[]): FieldMappingKind {
    if (field.composeUsing) {
        return FieldMappingKind.Composed;
    }

    const sourceProperty = field.sourceProperty ?? field.name;
    if (!commandProperties.includes(sourceProperty)) {
        return FieldMappingKind.Broken;
    }

    // A field that names the property of its own name maps to it the way one that names nothing does.
    return field.sourceProperty && field.sourceProperty !== field.name ? FieldMappingKind.Renamed : FieldMappingKind.AutoMapped;
}
