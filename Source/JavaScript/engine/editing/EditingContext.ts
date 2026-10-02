// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScope, QueryCandidate } from '@cratis/scene.model';
import { EffectiveIconCatalog } from '../icons/EffectiveIconCatalog';
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

    /**
     * The icons the profile can use. When present, an icon value that is edited is checked against it - a
     * library the profile lacks, an icon the library no longer has, a library at an incompatible version -
     * and inspection reports the same problems for values already stored, which are kept either way.
     * Without it an icon value is checked for shape only. An edit is applied synchronously, so
     * `await iconCatalog.load()` first for definite answers about icons and variants; until a library's
     * catalog is loaded its icons are reported as not verified.
     */
    iconCatalog?: EffectiveIconCatalog;
}
