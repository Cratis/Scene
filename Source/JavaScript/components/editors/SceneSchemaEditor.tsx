// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { SchemaEditor } from '@cratis/components/SchemaEditor';
import { JsonSchema } from '@cratis/components/types';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, objectProperty, stringProperty } from '../properties';
import { useEditableCopy } from './useEditableCopy';

/**
 * The `Cratis.Components:schemaEditor` component - `SchemaEditor` from `@cratis/components/SchemaEditor`.
 *
 * Edits a JSON schema as a typed property tree rather than as text. In a Cratis application this is how
 * an event type's shape is inspected and evolved, so `canEdit` and `canNotEditReason` are a pair worth
 * setting together - a schema is often deliberately read-only, and saying *why* in the same place is
 * what keeps that from looking like a bug.
 */
export function SceneSchemaEditor({ element }: RegisteredComponentProps) {
    const declared = useMemo(() => (objectProperty(element.properties, 'schema') ?? {}) as unknown as JsonSchema, [element.properties]);
    const [schema, setSchema] = useEditableCopy(declared);

    return (
        <SchemaEditor
            schema={schema}
            eventTypeName={stringProperty(element.properties, 'eventTypeName')}
            canEdit={booleanProperty(element.properties, 'canEdit')}
            canNotEditReason={stringProperty(element.properties, 'canNotEditReason')}
            editMode={booleanProperty(element.properties, 'editMode')}
            onChange={setSchema}
            className={stringProperty(element.properties, 'className')}
        />
    );
}
