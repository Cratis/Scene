// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary, BindingKind, MissingBinding, resolveElementBinding } from '../bindings';
import { booleanProperty, objectProperty, stringProperty } from '../properties';
import { SingleResultStatus } from './SingleResultStatus';

const SingleResultRuntime = lazy(() => import('./SingleResultRuntime'));

/** Read-only scalar field of an optional single model; the host owns and commits the input. */
export function SceneSingleResult({ element }: RegisteredComponentProps) {
    const { name, target } = resolveElementBinding(element, BindingKind.Query);
    if (!target) return <MissingBinding element={element} kind={BindingKind.Query} name={name} />;

    // Nothing, including loading Arc, happens until the host explicitly commits its input.
    if (!element.isEnabled || booleanProperty(element.properties, 'enabled') !== true) {
        return <SingleResultStatus state='idle' />;
    }

    const queryArguments = objectProperty(element.properties, 'queryArguments');
    const resultField = stringProperty(element.properties, 'resultField');
    if (!queryArguments || !resultField) return <SingleResultStatus state='failure' />;

    return <ArcRuntimeBoundary>
        <SingleResultRuntime query={target} queryArguments={queryArguments} resultField={resultField} />
    </ArcRuntimeBoundary>;
}
