// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { ObjectContentEditor } from '@cratis/components/ObjectContentEditor';
import { Json, JsonSchema } from '@cratis/components/types';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, objectProperty, stringProperty } from '../properties';
import { useEditableCopy } from './useEditableCopy';

/**
 * The `Cratis.Components:objectContentEditor` component - `ObjectContentEditor` from
 * `@cratis/components/ObjectContentEditor`.
 *
 * Renders an arbitrary JSON document against its schema, so nested objects and arrays are navigable and
 * each value is edited with a control that matches its declared type. That is what makes it worth
 * exposing to a screen at all: the alternative is a textarea full of JSON, which is not an editor.
 *
 * `object` and `schema` come through the property bag as plain JSON, which is exactly what they are at
 * runtime - the conversions state that, since the property bag is typed as unknown values by definition.
 */
export function SceneObjectContentEditor({ element }: RegisteredComponentProps) {
    const declared = useMemo(() => (objectProperty(element.properties, 'object') ?? {}) as unknown as Json, [element.properties]);
    const schema = useMemo(() => (objectProperty(element.properties, 'schema') ?? {}) as unknown as JsonSchema, [element.properties]);
    const [object, setObject] = useEditableCopy(declared);

    return (
        <ObjectContentEditor
            object={object}
            schema={schema}
            editMode={booleanProperty(element.properties, 'editMode')}
            onChange={setObject}
            className={stringProperty(element.properties, 'className')}
        />
    );
}
