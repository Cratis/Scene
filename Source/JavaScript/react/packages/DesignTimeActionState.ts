// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignTimeActionDescriptor } from '@cratis/scene.model';

/**
 * One design-time action as a designer presents it, with the visibility and enablement its owning package
 * decided. An action without a loaded handler is shown disabled, with the reason.
 */
export interface DesignTimeActionState {
    descriptor: DesignTimeActionDescriptor;

    /** The package that owns the handler. */
    package: string;

    visible: boolean;
    enabled: boolean;

    /** Why the action is unavailable, when it is. */
    diagnostic?: string;
}
