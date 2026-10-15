// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, FeatureNode, ModuleNode, SliceKind, SliceNode } from '@cratis/scene.model';
import { StructureDiagnostic } from './StructureDiagnostic';
import { StructureDiagnosticCode } from './StructureDiagnosticCode';

/**
 * Answers the questions navigation, toolbar and template applicability ask of an {@link ApplicationStructure}:
 * does this module, feature or slice exist, which feature comes first in a module, and what kind of slice is it.
 * Pure and read-only; when ids are duplicated the first declaration wins and {@link diagnostics} reports the rest.
 *
 * The C# engine (`ApplicationStructureIndex`) answers the same questions the same way; both are asserted
 * against `application-structure-fixtures.json`.
 */
export class ApplicationStructureIndex {
    private readonly modules = new Map<string, ModuleNode>();
    private readonly features = new Map<string, FeatureNode>();
    private readonly slices = new Map<string, SliceNode>();
    private readonly featuresByName = new Map<string, string[]>();

    /** The problems found while indexing, in declaration order. */
    readonly diagnostics: StructureDiagnostic[] = [];

    /**
     * Initializes a new instance of the {@link ApplicationStructureIndex} class.
     * @param structure The application structure to index.
     */
    constructor(readonly structure: ApplicationStructure) {
        const seen = new Map<string, string>();
        const names = new Map<string, string>();

        for (const module of structure.modules) {
            const qualified = module.id;
            if (!this.claim(seen, qualified, 'module')) continue;

            this.modules.set(qualified, module);
            this.reportAmbiguousName(names, 'module', module.name, qualified);
            this.indexContainer(qualified, module.features, module.slices ?? []);
        }
    }

    /**
     * Finds a module by its id.
     * @param moduleId The module id, for example `sales`.
     * @returns The module, or undefined when there is none.
     */
    findModule(moduleId: string): ModuleNode | undefined {
        return this.modules.get(moduleId);
    }

    /**
     * Finds a feature by its qualified id.
     * @param qualifiedId The dotted id from the module down, for example `sales.orders` or `sales.orders.returns`.
     * @returns The feature, or undefined when there is none.
     */
    findFeature(qualifiedId: string): FeatureNode | undefined {
        return this.features.get(qualifiedId);
    }

    /**
     * Gets the first feature of a module - the one a navigation target that names only the module goes to.
     * @param moduleId The module id.
     * @returns The module's first top-level feature, or undefined when the module is unknown or has no features.
     */
    firstFeature(moduleId: string): FeatureNode | undefined {
        return this.findModule(moduleId)?.features[0];
    }

    /**
     * Gets the qualified id of the first feature of a module.
     * @param moduleId The module id.
     * @returns The qualified id, or undefined when the module is unknown or has no features.
     */
    firstFeatureId(moduleId: string): string | undefined {
        const feature = this.firstFeature(moduleId);
        return feature ? `${moduleId}.${feature.id}` : undefined;
    }

    /**
     * Finds a slice by its qualified id.
     * @param qualifiedId The dotted id from the module down, for example `sales.orders.PlaceOrder`.
     * @returns The slice, or undefined when there is none.
     */
    findSlice(qualifiedId: string): SliceNode | undefined {
        return this.slices.get(qualifiedId);
    }

    /**
     * Gets what kind a slice is.
     * @param sliceId The slice's qualified id.
     * @returns The kind, or undefined when there is no such slice.
     */
    kindOf(sliceId: string): SliceKind | undefined {
        return this.findSlice(sliceId)?.kind;
    }

    /**
     * Finds every feature that has a given display name, in every module, so a caller can tell when a bare name is ambiguous.
     * @param name The display name, compared without regard to case.
     * @returns The qualified ids of the features with that name, in declaration order.
     */
    findFeaturesByName(name: string): string[] {
        return [...(this.featuresByName.get(name.toLowerCase()) ?? [])];
    }

    private indexContainer(path: string, features: FeatureNode[], slices: SliceNode[]): void {
        const seen = new Map<string, string>();
        const featureNames = new Map<string, string>();
        const sliceNames = new Map<string, string>();

        for (const feature of features) {
            const qualified = `${path}.${feature.id}`;
            if (!this.claim(seen, qualified, 'feature')) continue;

            this.features.set(qualified, feature);
            const key = feature.name.toLowerCase();
            const byName = this.featuresByName.get(key) ?? [];
            byName.push(qualified);
            this.featuresByName.set(key, byName);
            this.reportAmbiguousName(featureNames, 'feature', feature.name, qualified);
            this.indexContainer(qualified, feature.features, feature.slices);
        }

        for (const slice of slices) {
            const qualified = `${path}.${slice.id}`;
            if (!this.claim(seen, qualified, 'slice')) continue;

            this.slices.set(qualified, slice);
            this.reportAmbiguousName(sliceNames, 'slice', slice.name, qualified);
        }
    }

    private claim(seen: Map<string, string>, qualified: string, kind: string): boolean {
        const first = seen.get(qualified);
        if (first === undefined) {
            seen.set(qualified, kind);
            return true;
        }

        this.diagnostics.push({
            code: StructureDiagnosticCode.StructureDuplicateId,
            message: `Id '${qualified}' is declared more than once; the first ${first} wins.`,
            id: qualified,
        });
        return false;
    }

    private reportAmbiguousName(names: Map<string, string>, kind: string, name: string, qualified: string): void {
        const key = name.toLowerCase();
        const first = names.get(key);
        if (first !== undefined) {
            this.diagnostics.push({
                code: StructureDiagnosticCode.StructureAmbiguousName,
                message: `The ${kind} name '${name}' is used by both '${first}' and '${qualified}'.`,
                id: qualified,
            });
            return;
        }

        names.set(key, qualified);
    }
}
