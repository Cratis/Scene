// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BindingExpression } from './BindingExpression';

/**
 * Where activating something takes the user: a screen, named rather than addressed. Turning the name into a
 * URL, query string or native deep link is a renderer's job, the same as for a `NavigateAction`.
 */
export interface DestinationReference {
    /** The name of the screen to go to. */
    screen: string;

    /** The values for the screen's route parameters, keyed by parameter name. */
    routeParameterBindings?: Record<string, BindingExpression>;
}

export const DestinationReferencePropertyNames: (keyof DestinationReference)[] = ['screen', 'routeParameterBindings'];
