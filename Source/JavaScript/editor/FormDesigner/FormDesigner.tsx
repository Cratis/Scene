// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Form } from '@cratis/scene.model';
import { classifyFormFields } from './classifyFormFields';
import { FieldMappingKind } from './FieldMappingKind';
import { PopulateSourceKind } from './PopulateSourceKind';
import { summarizePopulateSource } from './PopulateSourceSummary';
import './FormDesigner.css';

export interface FormDesignerProps {
    form: Form;

    /** The property names declared on the form's `forCommand` - see `classifyFormFields`. */
    commandProperties: readonly string[];

    /** Called with a field's name when its row is activated - the compose-using/rename affordances hand off to the caller rather than editing inline (see StudioIssues#157's open question). */
    onFieldSelected?: (fieldName: string) => void;
}

const kindLabel: Record<FieldMappingKind, string> = {
    [FieldMappingKind.AutoMapped]: 'Auto-mapped',
    [FieldMappingKind.Renamed]: 'Renamed',
    [FieldMappingKind.Composed]: 'Composed',
    [FieldMappingKind.Broken]: 'Broken',
};

const populateSourceLabel: Record<PopulateSourceKind, string> = {
    [PopulateSourceKind.None]: 'No populate source',
    [PopulateSourceKind.ViaQuery]: 'Populate via query',
    [PopulateSourceKind.FromItem]: 'Populate from item',
};

/**
 * The field mapping surface for a {@link Form} - StudioIssues#157. Shows the populate source and every
 * field's mapping tier, with a `Broken` state for a field whose source property no longer exists on the
 * command, surfacing the compiler's rename-breaks-the-build guarantee visually instead of only at build
 * time. `Composed` fields hand off `onFieldSelected` to the caller rather than editing the callback
 * inline - the callback is arbitrary C#, so this designer is not a code editor.
 */
export function FormDesigner({ form, commandProperties, onFieldSelected }: FormDesignerProps) {
    const populateSource = summarizePopulateSource(form.populateSource);
    const mappings = classifyFormFields(form, commandProperties);

    return (
        <div className="studio-editor-form-designer">
            <div className="studio-editor-form-designer-populate-source">
                <span>{populateSourceLabel[populateSource.kind]}</span>
                {populateSource.kind === PopulateSourceKind.ViaQuery && (
                    <span className="studio-editor-form-designer-populate-source-detail">
                        {populateSource.queryName}
                        {populateSource.parameterNames.length > 0 && ` by ${populateSource.parameterNames.join(', ')}`}
                    </span>
                )}
            </div>
            <ul className="studio-editor-form-designer-fields">
                {mappings.map(({ field, kind }) => (
                    <li
                        key={field.name}
                        className={`studio-editor-form-designer-field studio-editor-form-designer-field--${kind}`}
                        onClick={() => onFieldSelected?.(field.name)}
                    >
                        <span className="studio-editor-form-designer-field-name">{field.name}</span>
                        <span className="studio-editor-form-designer-field-kind">{kindLabel[kind]}</span>
                        {field.sourceProperty && <span className="studio-editor-form-designer-field-detail">from {field.sourceProperty}</span>}
                        {field.composeUsing && <span className="studio-editor-form-designer-field-detail">compose using {field.composeUsing}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
}
