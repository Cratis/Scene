// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PopulateSource, PopulateViaQuery } from '@cratis/scene.model';
import { PopulateSourceKind } from './PopulateSourceKind';

/**
 * A display-ready summary of a {@link Form}'s `populateSource` - part of StudioIssues#157's
 * populate-source picker.
 */
export interface PopulateSourceSummary {
    kind: PopulateSourceKind;
    queryName?: string;
    parameterNames: string[];
}

/**
 * Summarizes a {@link Form}'s `populateSource` for display. `PopulateSource` is a marker interface with no
 * discriminant, so this narrows structurally on the property each variant actually declares
 * (`queryName` for {@link PopulateViaQuery}, `itemBinding` for `PopulateFromItem`) - the same
 * duck-typing approach `extractNavigationItem` (Cratis/Scene#2) uses for `Contribution.content.properties`.
 *
 * @param populateSource The form's `populateSource`, or `undefined` when it declares none.
 * @returns The {@link PopulateSourceSummary}.
 */
export function summarizePopulateSource(populateSource: PopulateSource | undefined): PopulateSourceSummary {
    if (!populateSource) {
        return { kind: PopulateSourceKind.None, parameterNames: [] };
    }

    if (isViaQuery(populateSource)) {
        return { kind: PopulateSourceKind.ViaQuery, queryName: populateSource.queryName, parameterNames: Object.keys(populateSource.parameterBindings) };
    }

    return { kind: PopulateSourceKind.FromItem, parameterNames: [] };
}

function isViaQuery(populateSource: PopulateSource): populateSource is PopulateViaQuery {
    return 'queryName' in populateSource;
}
