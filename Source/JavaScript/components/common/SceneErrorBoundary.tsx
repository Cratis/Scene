// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ErrorBoundary } from '@cratis/components/Common';
import { RegisteredComponentProps } from '@cratis/scene.react';

/**
 * The `Cratis.Components:errorBoundary` component - `ErrorBoundary` from `@cratis/components/Common`.
 *
 * Lets a screen decide where a failure stops. React's default is that a throw anywhere unmounts the
 * whole tree, which for a composed screen means one broken region takes the navigation with it; placing
 * a boundary around a region scopes that to the region. Which regions deserve one is a design decision
 * about the screen, which is precisely why it belongs in the screen rather than in the renderer.
 */
export function SceneErrorBoundary({ slots }: RegisteredComponentProps) {
    return <ErrorBoundary>{slots.content}</ErrorBoundary>;
}
