// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a preview shows (spec PRV1/PRV3): a module - the application shell with the module's effective navigation and its
 * first feature -, one of its features - the same shell with that feature - or a slice. Ids are the qualified ids of the
 * application structure: `sales`, `sales.orders`, `sales.orders.PlaceOrder`. A feature may also be given relative to its module
 * (`orders`).
 *
 * A State Change slice opens its dialog over a minimal host page; a State View slice renders its data fragment.
 *
 * `{ application: true }` previews the application itself (spec N3, N5): the shell with the application's navigation and a default
 * destination - the one `initialDestination` names, else the first destination of the application's navigation, else its first
 * screen. Use it for an application with no authored structure (a blueprint's gallery) or to browse everything the shell leads to.
 * A string names the application and is informational.
 */
export type PreviewTarget =
    | { module: string; feature?: string }
    | { slice: string }
    | { application: true | string };

/** Whether a target names a slice. */
export function isSliceTarget(target: PreviewTarget): target is { slice: string } {
    return 'slice' in target;
}

/** Whether a target is the application itself. */
export function isApplicationTarget(target: PreviewTarget): target is { application: true | string } {
    return 'application' in target;
}
