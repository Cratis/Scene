// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { elementNodeId, inspect, type EditingContext } from '@cratis/scene.engine';
import type { QueryCandidate, SceneDocument, SceneElement } from '@cratis/scene.model';
import { everyElementId } from '../Selection/sceneTree';

export interface ComponentOutputSource {
    componentId: string;
    label: string;
    outputs: { path: string; label: string; type: string }[];
}

export interface CommandResponseSource {
    command: string;
    paths: string[];
}

export interface BindingSourceInventory {
    dataContextPaths: string[];
    // The response of the command whose success continuation the edited value runs in; absent where no command action is in scope.
    commandResponse?: CommandResponseSource;
    queryResults: { id: string; name: string; fields: string[] }[];
    componentOutputs: ComponentOutputSource[];
}

export function bindingSourceInventory(
    document: SceneDocument,
    roots: readonly SceneElement[],
    context: EditingContext,
    availableSources: Record<string, string>,
    candidates: readonly QueryCandidate[]): BindingSourceInventory {
    const componentOutputs = everyElementId(roots)
        .map(componentId => outputSourceFor(document, componentId, context))
        .filter((source): source is ComponentOutputSource => !!source && source.outputs.length > 0);

    return {
        dataContextPaths: Object.keys(availableSources).sort((first, second) => first.localeCompare(second)),
        queryResults: candidates.map(candidate => ({ id: candidate.id, name: candidate.name, fields: candidate.resultFields.map(field => field.name) })),
        componentOutputs,
    };
}

function outputSourceFor(document: SceneDocument, componentId: string, context: EditingContext): ComponentOutputSource | undefined {
    const inspection = inspect(document, elementNodeId(componentId), context);
    if (!inspection) return undefined;
    const outputs = inspection.properties
        .filter(property => property.descriptor.output === true)
        .map(property => ({ path: property.descriptor.path, label: property.descriptor.label, type: String(property.descriptor.valueType) }));

    return { componentId, label: inspection.label, outputs };
}
