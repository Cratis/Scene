// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, EffectiveConfiguration, EffectivePropertyValue, InstanceContribution, SceneDocument } from '@cratis/scene.model';
import { resolveEffectiveConfiguration, resolveTemplateChain } from '../../index';
import { catalog, scopeOf } from '../../given/a_scene_document';

export function resolve(document: SceneDocument, kind: EditingScopeKind, name: string): EffectiveConfiguration {
    return resolveEffectiveConfiguration(resolveTemplateChain(document, scopeOf(kind, name, 'Shell')), document.instanceContributions, catalog);
}

export function valueOf(configuration: EffectiveConfiguration, component: string, path: string): EffectivePropertyValue | undefined {
    return configuration.components.find(candidate => candidate.component === component)?.values.find(value => value.path === path);
}

export function scalar(instance: string, path: string, value: unknown, component = 'navbar'): InstanceContribution {
    return { instance, component, path, value };
}

export function items(instance: string, ...contributed: { id: string; values: Record<string, unknown> }[]): InstanceContribution {
    return { instance, component: 'navbar', path: 'items', items: contributed };
}

export const codes = (configuration: EffectiveConfiguration) => configuration.diagnostics.map(diagnostic => diagnostic.code);
