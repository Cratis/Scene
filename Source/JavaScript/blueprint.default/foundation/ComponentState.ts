// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ExternalComponent } from '@cratis/scene.model';

/**
 * The visual states every data-showing foundation component defines (spec Part B 1.4).
 *
 * A template is only worth choosing if it looks right in all of them: an application spends real time loading, empty, failing
 * and not allowed, and a component that only draws its populated self has not been finished.
 */
export enum ComponentState {
    /** The data is there and drawn. */
    Ready = 'ready',

    /** The data has not answered yet: a skeleton in the shape of the content, never a spinner alone. */
    Loading = 'loading',

    /** The data answered with nothing: an explanation and the primary action. */
    Empty = 'empty',

    /** The data could not be loaded: a message and a retry. */
    Error = 'error',

    /** The user may not see the data: what is missing, and nothing of the data. */
    NoPermission = 'noPermission',

    /** Some regions loaded and some failed: what loaded, plus which parts did not. */
    Partial = 'partial',
}

/** Every state, in the order a preview or a story lists them. */
export const componentStates: readonly ComponentState[] = Object.values(ComponentState);

/**
 * Reads the state a component is in from its properties.
 *
 * An explicit `state` property wins, which is how a preview forces a state. Otherwise the state follows the properties a bound
 * query already publishes - the same `loading` and `error` the preview states use for tables - plus `forbidden` and
 * `failedRegions`, and falls to Empty when the component has nothing to show.
 *
 * @param element The element being rendered.
 * @param hasData Whether the component has anything to draw when it is ready.
 */
export function readComponentState(element: ExternalComponent, hasData: boolean): ComponentState {
    const { state, forbidden, error, loading, failedRegions } = element.properties;
    if (typeof state === 'string' && (componentStates as readonly string[]).includes(state)) return state as ComponentState;
    if (forbidden === true) return ComponentState.NoPermission;
    if (typeof error === 'string' && error.length > 0) return ComponentState.Error;
    if (loading === true) return ComponentState.Loading;
    if (Array.isArray(failedRegions) && failedRegions.length > 0) return ComponentState.Partial;
    return hasData ? ComponentState.Ready : ComponentState.Empty;
}
