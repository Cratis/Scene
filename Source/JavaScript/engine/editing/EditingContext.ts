// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScope, QueryCandidate } from '@cratis/scene.model';
import { DescriptorCatalog } from './DescriptorCatalog';

/**
 * What inspection and editing need to know besides the document: what can be described, what is being edited,
 * and which queries the host offers.
 */
export interface EditingContext {
    /** The descriptors of the components and layout types in play. */
    catalog: DescriptorCatalog;

    /** The screen, template or layout being edited; it decides what is local. */
    scope: EditingScope;

    /**
     * The queries a property may be bound to, as the host discovered them. When a `QueryReference` value is
     * edited it is checked against these; without them it is checked for shape only.
     */
    queryCandidates?: QueryCandidate[];
}
