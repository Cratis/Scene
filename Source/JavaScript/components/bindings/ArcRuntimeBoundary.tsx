// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, Suspense } from 'react';
import { ErrorBoundary } from '@cratis/components/Common';

export interface ArcRuntimeBoundaryProps {
    /** The lazily loaded, Arc-bound content this boundary isolates. */
    children: ReactNode;
}

/**
 * Isolates one Arc-bound component so that neither loading it nor failing to load it can take the
 * surrounding screen down with it.
 *
 * The Arc-bound half of `@cratis/components` - `DataPage`, the data tables, `CommandForm` and its
 * fields, every dialog - reaches `@cratis/arc` and `@cratis/arc.react` at import time. Those are peer
 * dependencies the *host* supplies, and a design surface is not a host: Studio previews a screen without
 * an Arc client, without a backend, and often without a single binding registered. This package
 * therefore imports every Arc-bound component through a dynamic `import()` rather than a static one, so
 * that a screen made only of the library's Arc-free components never pulls the Arc runtime in at all.
 *
 * That deferral has two visible states, and this covers both: `Suspense` while the chunk is in flight,
 * and the library's own `ErrorBoundary` when it cannot be loaded - which is what a host without Arc
 * installed will see. One dashed-out region, not a blank screen and not a thrown render.
 *
 * `ErrorBoundary` is used by composition rather than by writing another one: an error boundary is the
 * one thing React still requires a class for, and `@cratis/components` already ships that class.
 */
export function ArcRuntimeBoundary({ children }: ArcRuntimeBoundaryProps) {
    return (
        <ErrorBoundary>
            <Suspense fallback={<span data-scene-arc-loading=''>Loading</span>}>{children}</Suspense>
        </ErrorBoundary>
    );
}
