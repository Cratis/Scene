// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ApplicationStructure, FeatureNode, SliceKind } from '@cratis/scene.model';
import { ApplicationStructureIndex } from '@cratis/scene.engine';
import { PreviewTarget, isSliceTarget } from './PreviewTarget';
import { PreviewProblem, PreviewProblemCode, PreviewProblemSeverity } from './PreviewProblem';

/** What a target resolved to in the application structure. */
export interface PreviewPlan {
    /** `module`, `feature`, `stateChange` or `stateView`. */
    kind: 'module' | 'feature' | 'stateChange' | 'stateView';

    /** The module the preview is in. */
    module: string;

    /** The qualified id of the feature whose screen is the page: the module's first feature, the feature itself, or the slice's feature. */
    feature?: string;

    /** The qualified id of the slice, for a slice target. */
    slice?: string;

    /** The command a State Change slice accepts. */
    command?: string;

    /** The display names from the module down to the target - what the preview strip shows as `Sales › Orders` (PRV7). */
    breadcrumb: string[];
}

export interface PreviewPlanResult {
    plan?: PreviewPlan;
    problems: PreviewProblem[];
}

const error = (code: PreviewProblemCode, message: string, nodeId?: string): PreviewProblem => ({ code, severity: PreviewProblemSeverity.Error, message, ...(nodeId === undefined ? {} : { nodeId }) });

/** The feature a qualified id names, and the display names of the features above it, outermost first. */
function featurePath(structure: ApplicationStructure, qualified: string): { feature: FeatureNode; names: string[] } | undefined {
    const [moduleId, ...rest] = qualified.split('.');
    let features = structure.modules.find(module => module.id === moduleId)?.features;
    const names: string[] = [];
    let found: FeatureNode | undefined;
    for (const id of rest) {
        found = features?.find(candidate => candidate.id === id);
        if (!found) return undefined;
        names.push(found.name);
        features = found.features;
    }

    return found ? { feature: found, names } : undefined;
}

/**
 * Resolves a preview target against the application structure (PRV3): a module previews its first feature, a feature itself,
 * a slice the page of the feature it belongs to with the slice itself opened (State Change) or isolated (State View).
 * A target that is not in the structure resolves to a problem, not to a blank screen.
 */
export function resolvePreviewPlan(structure: ApplicationStructure | ApplicationStructureIndex, target: PreviewTarget): PreviewPlanResult {
    const index = structure instanceof ApplicationStructureIndex ? structure : new ApplicationStructureIndex(structure);

    if (isSliceTarget(target)) {
        const slice = index.findSlice(target.slice);
        if (!slice) return { problems: [error(PreviewProblemCode.TargetNotFound, `The slice '${target.slice}' is not in the application.`, target.slice)] };
        if (slice.kind === SliceKind.Automation) {
            return { problems: [error(PreviewProblemCode.SliceNotPreviewable, `The slice '${target.slice}' is an automation: it reacts to events and has nothing to show.`, target.slice)] };
        }

        const segments = target.slice.split('.');
        const module = segments[0];
        const featureId = segments.length > 2 ? segments.slice(0, -1).join('.') : undefined;
        const moduleNode = index.findModule(module);
        const path = featureId ? featurePath(index.structure, featureId) : undefined;
        const containerFeature = featureId ?? index.firstFeatureId(module);
        return {
            plan: {
                kind: slice.kind === SliceKind.StateChange ? 'stateChange' : 'stateView',
                module,
                feature: containerFeature,
                slice: target.slice,
                ...(slice.kind === SliceKind.StateChange ? { command: slice.command ?? slice.id } : {}),
                breadcrumb: [moduleNode?.name ?? module, ...(path?.names ?? []), slice.name],
            },
            problems: [],
        };
    }

    const moduleNode = index.findModule(target.module);
    if (!moduleNode) return { problems: [error(PreviewProblemCode.TargetNotFound, `The module '${target.module}' is not in the application.`, target.module)] };

    if (target.feature === undefined) {
        const first = index.firstFeatureId(target.module);
        if (first === undefined) return { problems: [error(PreviewProblemCode.ModuleWithoutFeatures, `The module '${moduleNode.name}' has no feature to show.`, target.module)] };
        return { plan: { kind: 'module', module: target.module, feature: first, breadcrumb: [moduleNode.name, ...(featurePath(index.structure, first)?.names ?? [])] }, problems: [] };
    }

    const qualified = target.feature.startsWith(`${target.module}.`) ? target.feature : `${target.module}.${target.feature}`;
    const path = featurePath(index.structure, qualified);
    if (!path) return { problems: [error(PreviewProblemCode.TargetNotFound, `The feature '${qualified}' is not in the application.`, qualified)] };
    return { plan: { kind: 'feature', module: target.module, feature: qualified, breadcrumb: [moduleNode.name, ...path.names] }, problems: [] };
}
