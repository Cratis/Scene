// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { ScreenTemplate } from '@cratis/scene.model';
import type { ScreenEditorEnvironment, ScreenEditorRuntime } from '@cratis/scene.editor';

const allowedIn = (templates: readonly ScreenTemplate[] | undefined, allowed: ReadonlySet<string>): ScreenTemplate[] | undefined =>
    templates?.filter(template => allowed.has(template.name));

/**
 * The runtime the editor is opened with when the session is limited to a set of templates: the packages' screen templates are narrowed to the set,
 * so the template picker and the palette of the editor offer no other. A template a screen is already built on stays, or the screen could not be drawn.
 */
export function restrictRuntimeToTemplateSet(runtime: ScreenEditorRuntime, templateSet: readonly string[] | undefined, inUse: readonly string[] = []): ScreenEditorRuntime {
    if (templateSet === undefined) return runtime;
    const allowed = new Set([...templateSet, ...inUse]);
    return { ...runtime, bundles: runtime.bundles.map(bundle => bundle.screenTemplates === undefined ? bundle : { ...bundle, screenTemplates: allowedIn(bundle.screenTemplates, allowed)! }) };
}

/** The environment of the editor under the session's template set: the same host-lent values, with the templates narrowed to the set. */
export function restrictEnvironmentToTemplateSet(environment: ScreenEditorEnvironment, templateSet: readonly string[] | undefined, inUse: readonly string[] = []): ScreenEditorEnvironment {
    if (templateSet === undefined) return environment;
    const allowed = new Set([...templateSet, ...inUse]);
    const own = allowedIn(environment.ownTemplates, allowed);
    const selectable = allowedIn(environment.selectableTemplates, allowed);
    return {
        ...environment,
        runtime: restrictRuntimeToTemplateSet(environment.runtime, templateSet, inUse),
        ...(own === undefined ? {} : { ownTemplates: own }),
        ...(selectable === undefined ? {} : { selectableTemplates: selectable }),
    };
}
