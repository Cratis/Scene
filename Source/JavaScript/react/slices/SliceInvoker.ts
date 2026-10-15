// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { InvocationResult } from './InvocationResult';

/**
 * Invokes a state change slice with a command payload. This is the seam between the toolbar's task dialogs and whatever
 * runs the command: Stage provides one that sends it, the Studio preview one that only checks it (`createDryRunInvoker`),
 * and the default announces it as an event. `@cratis/scene.react` knows no transport.
 */
export interface SliceInvoker {
    /**
     * Invokes the slice.
     * @param sliceId The qualified id of the slice, for example `sales.orders.PlaceOrder`.
     * @param payload The command's values, by property name.
     * @param command The command the slice accepts, when known.
     */
    invoke(sliceId: string, payload: Record<string, unknown>, command?: string): Promise<InvocationResult>;
}
