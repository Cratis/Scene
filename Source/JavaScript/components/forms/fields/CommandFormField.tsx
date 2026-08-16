// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode } from 'react';
import { ExternalComponent } from '@cratis/scene.model';
import { ArcRuntimeBoundary, Placeholder } from '../../bindings';
import { FieldBinding } from './FieldBinding';
import { resolveFieldBinding } from './resolveFieldBinding';

export interface CommandFormFieldProps {
    /** The element being adapted, read for its `property`, `title` and `description`. */
    element: ExternalComponent;

    /** Renders the real `@cratis/components` field, given the binding built from the element. */
    children: (binding: FieldBinding) => ReactNode;
}

/**
 * The part every command form field adapter does identically: resolve the element's `property` into a
 * {@link FieldBinding}, place a visible placeholder when there is none, and isolate the lazily loaded
 * Arc-bound field behind an {@link ArcRuntimeBoundary}.
 *
 * Factored out rather than repeated twelve times so that the behavior a screen author depends on - an
 * unbound field shows up as an unbound field, and one broken field does not take the form with it - is
 * defined once and cannot drift between field types.
 */
export function CommandFormField({ element, children }: CommandFormFieldProps) {
    const binding = resolveFieldBinding(element);
    if (!binding) return <Placeholder element={element} problem="Missing 'property'" />;

    return <ArcRuntimeBoundary>{children(binding)}</ArcRuntimeBoundary>;
}
