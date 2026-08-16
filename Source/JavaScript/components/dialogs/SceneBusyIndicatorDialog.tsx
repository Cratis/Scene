// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { ArcRuntimeBoundary } from '../bindings';
import { stringProperty } from '../properties';

const BusyIndicatorDialog = lazy(async () => ({ default: (await import('@cratis/components/Dialogs')).BusyIndicatorDialog }));

/**
 * The `Cratis.Components:busyIndicatorDialog` component - `BusyIndicatorDialog` from
 * `@cratis/components/Dialogs`.
 *
 * The blocking spinner shown while a long-running command is in flight. In a running application it is
 * the Arc dialog host that renders it, threading its own `title` and `message` through; exposing it as a
 * Scene component is what lets a screen show the same chrome at design time, so its wording and
 * placement can be designed rather than discovered the first time an operation takes a while.
 */
export function SceneBusyIndicatorDialog({ element }: RegisteredComponentProps) {
    return (
        <ArcRuntimeBoundary>
            <BusyIndicatorDialog
                title={stringProperty(element.properties, 'title') ?? ''}
                message={stringProperty(element.properties, 'message') ?? ''}
            />
        </ArcRuntimeBoundary>
    );
}
