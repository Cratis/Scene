// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary, BindingKind, MissingBinding, resolveElementBinding } from '../bindings';
import { booleanProperty, stringProperty, unionProperty } from '../properties';

const StepperCommandDialog = lazy(async () => ({
    default: (await import('@cratis/components/CommandDialog')).StepperCommandDialog,
}));

/** Whether the step headers run across the top or down the side. */
const orientations = ['horizontal', 'vertical'] as const;

/**
 * The `Cratis.Components:stepperCommandDialog` component - `StepperCommandDialog` from
 * `@cratis/components/CommandDialog`.
 *
 * `commandDialog` split across steps, for a command with more fields than fit one screen. It stays a
 * single command: the steps partition the *fields*, not the intent, and nothing is submitted until the
 * last step - so a half-finished wizard leaves no trace, which is exactly what a command should do.
 *
 * `linear` decides whether a step can be skipped ahead of the one before it. The step panels go in the
 * `content` slot.
 */
export function SceneStepperCommandDialog({ element, slots }: RegisteredComponentProps) {
    const { name, target } = resolveElementBinding(element, BindingKind.Command);
    if (!target) return <MissingBinding element={element} kind={BindingKind.Command} name={name} />;

    return (
        <ArcRuntimeBoundary>
            <StepperCommandDialog
                title={stringProperty(element.properties, 'title') ?? ''}
                command={target}
                visible={booleanProperty(element.properties, 'visible') ?? true}
                width={stringProperty(element.properties, 'width')}
                linear={booleanProperty(element.properties, 'linear')}
                orientation={unionProperty(element.properties, 'orientation', orientations)}
                okLabel={stringProperty(element.properties, 'okLabel')}
                nextLabel={stringProperty(element.properties, 'nextLabel')}
                previousLabel={stringProperty(element.properties, 'previousLabel')}
                showCancel={booleanProperty(element.properties, 'showCancel')}
                cancelLabel={stringProperty(element.properties, 'cancelLabel')}
            >
                {slots.content}
            </StepperCommandDialog>
        </ArcRuntimeBoundary>
    );
}
