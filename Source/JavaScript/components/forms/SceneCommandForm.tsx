// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentType, lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary, BindingKind, BoundConstructor, MissingBinding, resolveElementBinding } from '../bindings';
import { stringArrayProperty } from '../properties';

interface AutoCommandFormElementProps {
    command: BoundConstructor;
    exclude?: string[];
}

/**
 * `AutoCommandForm` types `exclude` as `(keyof TCommand)[]`, which collapses to `never[]` when the
 * command type is only known at runtime - as it always is here, since the class arrives from the binding
 * registry rather than from a type annotation. The conversion states the shape this adapter actually
 * passes; the underlying component reads `exclude` as property names either way.
 */
const AutoCommandForm = lazy(async () => ({
    default: (await import('@cratis/components/CommandForm')).AutoCommandForm as unknown as ComponentType<AutoCommandFormElementProps>,
}));

/**
 * The `Cratis.Components:commandForm` component - `AutoCommandForm` from `@cratis/components/CommandForm`.
 *
 * `AutoCommandForm` rather than `CommandForm`, because a screen that had to list every field by hand
 * would go stale the moment a property is added to the command on the backend. `AutoCommandForm` reads
 * the command's own property descriptors and picks a field component per property type, so the form
 * follows the command - which is the same guarantee Arc's generated proxies give the rest of the stack.
 *
 * A screen that does want to place fields itself puts the field components from this package in the
 * `content` slot and names them individually; `exclude` keeps `AutoCommandForm` from generating a second
 * copy of anything placed that way.
 */
export function SceneCommandForm({ element }: RegisteredComponentProps) {
    const { name, target } = resolveElementBinding(element, BindingKind.Command);
    if (!target) return <MissingBinding element={element} kind={BindingKind.Command} name={name} />;

    return (
        <ArcRuntimeBoundary>
            <AutoCommandForm command={target} exclude={stringArrayProperty(element.properties, 'exclude')} />
        </ArcRuntimeBoundary>
    );
}
