// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { lazy } from 'react';
import { ArcRuntimeBoundary } from '../bindings';

const ConfirmationDialog = lazy(async () => ({ default: (await import('@cratis/components/Dialogs')).ConfirmationDialog }));

/**
 * The `Cratis.Components:confirmationDialog` component - `ConfirmationDialog` from
 * `@cratis/components/Dialogs`.
 *
 * Takes no properties by design: it is not a dialog a screen configures, it is the host that renders
 * whatever confirmation the running application has asked for through Arc's dialog service. A screen
 * places it once, near the root, and every `Are you sure?` in the application appears there.
 */
export function SceneConfirmationDialog() {
    return (
        <ArcRuntimeBoundary>
            <ConfirmationDialog />
        </ArcRuntimeBoundary>
    );
}
