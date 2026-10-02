// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProvenanceKind, SceneDocument } from '@cratis/scene.model';
import { EditingContext } from './EditingContext';
import { DocumentIndex, NodeRecord } from './DocumentIndex';
import { ExposureGrant, ExposureGrants, computeExposureGrants } from './exposureGrants';
import { indexDocument } from './indexDocument';
import { provenanceOf } from './inspect';
import { resolveEffectiveConfiguration } from './resolveEffectiveConfiguration';
import { resolveTemplateChain } from './resolveTemplateChain';
import { TemplateChain } from './TemplateChain';
import { EffectiveConfiguration } from '@cratis/scene.model';

/**
 * Everything an edit needs to decide whether it is allowed, worked out once against the document as it was.
 */
export class EditSession {
    readonly index: DocumentIndex;
    readonly chain: TemplateChain;
    readonly grants: ExposureGrants;
    readonly configuration: EffectiveConfiguration;

    constructor(readonly document: SceneDocument, readonly context: EditingContext) {
        this.index = indexDocument(document);
        this.chain = resolveTemplateChain(document, context.scope);
        this.grants = computeExposureGrants(this.chain, context.catalog);
        this.configuration = resolveEffectiveConfiguration(this.chain, document.instanceContributions, context.catalog);
    }

    /** The instance id the scope contributes as, or `undefined` when the scope was not found. */
    get scopeInstance(): string | undefined {
        return this.chain.levels.at(-1)?.instance;
    }

    /** What the scope's instance may configure on inherited components. */
    get scopeGrants(): Map<string, ExposureGrant> {
        return (this.scopeInstance === undefined ? undefined : this.grants.byInstance.get(this.scopeInstance)) ?? new Map();
    }

    /** Whether the scope itself owns the node. */
    isLocal(record: NodeRecord): boolean {
        return provenanceOf(record, this.chain, this.scopeGrants).kind === ProvenanceKind.Local;
    }

    /** Where an inherited node comes from, for a message. */
    sourceOf(record: NodeRecord): string {
        return record.owner;
    }
}
