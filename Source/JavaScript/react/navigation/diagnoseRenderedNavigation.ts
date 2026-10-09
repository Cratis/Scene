// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationDiagnostic, NavigationGraph, diagnoseNavigation } from '@cratis/scene.engine';
import { navigationRouteKey } from './navigationRouteKey';

/**
 * Diagnoses navigation the way this renderer routes it: the engine's checks, with duplicate routes compared
 * by the URLs `resolveDestination` actually builds - identity-derived routes included, parameter spellings
 * treated as equal.
 */
export function diagnoseRenderedNavigation(graph: NavigationGraph): NavigationDiagnostic[] {
    return diagnoseNavigation(graph, navigationRouteKey);
}
