// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from './BindingExpression';

import { DestinationKind } from './DestinationKind';

/**
 * Where activating something takes the user.
 *
 * Stable module/feature/slice identity is carried separately from labels and authored URLs. A renderer maps
 * the destination to a URL, route state, native deep link, dialog or named outlet without guessing from text.
 */
export interface DestinationReference {
    /** The legacy or explicit screen name to go to. */
    screen?: string;

    /** Stable module identity. */
    module?: string;

    /** Stable feature identity inside the module. */
    feature?: string;

    /** Stable slice identity inside the feature. */
    slice?: string;

    /** The named outlet to replace; absent means the host's primary outlet. */
    outlet?: string;

    /** The authored URL/path override, when the default route should not be derived from identity. */
    route?: string;

    /** Whether this opens in an outlet, a dialog, or an external target. */
    kind?: DestinationKind;

    /** A dialog template or dialog identity when `kind` is `dialog`. */
    dialog?: string;

    /** The values for route or screen parameters, keyed by parameter name. */
    routeParameterBindings?: Record<string, BindingExpression>;
}

export const DestinationReferencePropertyNames: (keyof DestinationReference)[] = [
    'screen', 'module', 'feature', 'slice', 'outlet', 'route', 'kind', 'dialog', 'routeParameterBindings',
];
