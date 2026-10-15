// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SliceInvoker } from './SliceInvoker';

/**
 * The invoker used when a host provides none: it announces the command with the host-neutral `cratis.scene.command` event,
 * as a `core:toolbarItem` action always has, and reports success. A host that listens for the event runs the command.
 */
export function createAnnouncingInvoker(): SliceInvoker {
    return {
        async invoke(sliceId, payload, command) {
            globalThis.dispatchEvent(new CustomEvent('cratis.scene.command', { detail: { command: command ?? sliceId, slice: sliceId, arguments: payload } }));
            return { succeeded: true, payload };
        },
    };
}
