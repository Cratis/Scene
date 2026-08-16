// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary } from '../bindings';
import { booleanProperty, stringProperty } from '../properties';

const Dialog = lazy(async () => ({ default: (await import('@cratis/components/Dialogs')).Dialog }));

/**
 * The `Cratis.Components:dialog` component, registered under the bare name `dialog` - `Dialog` from
 * `@cratis/components/Dialogs`.
 *
 * Shadowing PrimeReact's `dialog` deliberately. PrimeReact's is a modal frame and nothing more; this one
 * resolves its result through Arc's dialog context, so a screen's dialog participates in the same
 * request/response protocol as the rest of the application - a caller awaits a `DialogResult` instead of
 * threading `visible` state and callbacks by hand.
 *
 * `visible` defaults to `true` because a dialog placed on a screen is being placed to be seen; a host
 * that controls visibility sets the property explicitly.
 */
export function SceneDialog({ element, slots }: RegisteredComponentProps) {
    return (
        <ArcRuntimeBoundary>
            <Dialog
                title={stringProperty(element.properties, 'title') ?? ''}
                visible={booleanProperty(element.properties, 'visible') ?? true}
                width={stringProperty(element.properties, 'width')}
                resizable={booleanProperty(element.properties, 'resizable')}
                isValid={booleanProperty(element.properties, 'isValid')}
                isBusy={booleanProperty(element.properties, 'isBusy')}
                okLabel={stringProperty(element.properties, 'okLabel')}
                cancelLabel={stringProperty(element.properties, 'cancelLabel')}
                className={stringProperty(element.properties, 'className')}
            >
                {slots.content}
            </Dialog>
        </ArcRuntimeBoundary>
    );
}
