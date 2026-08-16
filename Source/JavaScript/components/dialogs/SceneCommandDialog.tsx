// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary, BindingKind, MissingBinding, resolveElementBinding } from '../bindings';
import { booleanProperty, stringProperty } from '../properties';

const CommandDialog = lazy(async () => ({ default: (await import('@cratis/components/CommandDialog')).CommandDialog }));

/**
 * The `Cratis.Components:commandDialog` component - `CommandDialog` from `@cratis/components/CommandDialog`.
 *
 * A dialog whose confirm button *is* the command's execution: it binds the form to the command, submits
 * on confirm, feeds the backend's validation results back onto the fields, and only closes when the
 * command succeeded. That last part is the reason to use it rather than composing `dialog` with
 * `commandForm` - a hand-composed pair has no way to keep the dialog open on a rejected command without
 * reimplementing the protocol.
 *
 * The `command` property names an Arc command proxy; the fields go in the `content` slot.
 */
export function SceneCommandDialog({ element, slots }: RegisteredComponentProps) {
    const { name, target } = resolveElementBinding(element, BindingKind.Command);
    if (!target) return <MissingBinding element={element} kind={BindingKind.Command} name={name} />;

    return (
        <ArcRuntimeBoundary>
            <CommandDialog
                title={stringProperty(element.properties, 'title') ?? ''}
                command={target}
                visible={booleanProperty(element.properties, 'visible') ?? true}
                width={stringProperty(element.properties, 'width')}
                resizable={booleanProperty(element.properties, 'resizable')}
                okLabel={stringProperty(element.properties, 'okLabel')}
                cancelLabel={stringProperty(element.properties, 'cancelLabel')}
                className={stringProperty(element.properties, 'className')}
            >
                {slots.content}
            </CommandDialog>
        </ArcRuntimeBoundary>
    );
}
