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
 *
 * `dismissable` replaces the `resizable` property this adapter used to carry, and the swap is the whole
 * PrimeReact 11 story in miniature. `resizable` is still declared on `DialogProps` so call sites compile,
 * but version 11's headless dialog has no resize handle and the library never reads the prop - a screen
 * setting it got nothing. `dismissable` is the opposite: 3.0.0 added it and honors it, and it decides
 * whether the header close button, backdrop click and `Escape` are offered at all. Leaving it unset keeps
 * the library's own default, so a screen opts into a dismiss affordance rather than having one imposed.
 *
 * `closeAriaLabel` names that close button. It is separate from every other label here because it is the
 * only one a screen reader reads and nobody sees, which is exactly why it gets forgotten - offering it
 * next to `okLabel` and `cancelLabel` is what makes localizing a dialog a complete job.
 */
export function SceneDialog({ element, slots }: RegisteredComponentProps) {
    return (
        <ArcRuntimeBoundary>
            <Dialog
                title={stringProperty(element.properties, 'title') ?? ''}
                visible={booleanProperty(element.properties, 'visible') ?? true}
                width={stringProperty(element.properties, 'width')}
                dismissable={booleanProperty(element.properties, 'dismissable')}
                isValid={booleanProperty(element.properties, 'isValid')}
                isBusy={booleanProperty(element.properties, 'isBusy')}
                okLabel={stringProperty(element.properties, 'okLabel')}
                cancelLabel={stringProperty(element.properties, 'cancelLabel')}
                closeAriaLabel={stringProperty(element.properties, 'closeAriaLabel')}
                className={stringProperty(element.properties, 'className')}
            >
                {slots.content}
            </Dialog>
        </ArcRuntimeBoundary>
    );
}
