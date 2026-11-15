// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { QueryResultShape, type Layout, type QueryCandidate, type SceneDocument, type ScreenTemplate } from '@cratis/scene.model';
import type { StateChangeSlice } from '../Actions/StateChangeSlice';
import { screenPlacementSlots, type PlacementEnvironment } from './hookPlacement';

export interface PlacementEnvironmentInputs {
    document: SceneDocument;
    screen: string;
    slices: readonly StateChangeSlice[];
    queries: readonly QueryCandidate[];
    templates?: readonly ScreenTemplate[];
    layouts?: readonly Layout[];
}

// What a hook of the screen's outlets is worked out against: the slices, the slots of the page the screen is, and where a slice that runs without its form
// could take its inputs from - the fields of the rows the page lists, which are an item's. The page's own route values are not known while it is designed: a routed
// slot has its parameter only once it is open, so it is not counted on.
export function placementEnvironmentOf({ document, screen, slices, queries, templates = [], layouts = [] }: PlacementEnvironmentInputs): PlacementEnvironment {
    const slots = screenPlacementSlots(document, templates, layouts, screen);
    return {
        slices,
        slots,
        itemFields: new Set(queries.filter(query => query.resultShape === QueryResultShape.Collection).flatMap(query => query.resultFields.map(field => field.name))),
        routeParameters: [],
    };
}
