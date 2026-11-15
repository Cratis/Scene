// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applyEdit, createDescriptorCatalog } from '@cratis/scene.engine';
import { SceneDiagnostic, SceneDocument, Screen, ScreenTemplate, UiProfile } from '@cratis/scene.model';
import { addScreenToSet, moveScreenInSet, removeScreenFromSet } from '../screenSet/screenSetOperations';
import { DesignProfileKey } from './DesignOperation';
import { DesignDiagnostic, ScopedSceneEdit } from './DesignOutcome';
import { DesignContext, DesignWorkspace } from './DesignWorkspace';
import { LoweredStep } from './lowerOperation';
import { applyProfileValue } from './profileOperations';

/** The Scene engine's finding as a design diagnostic. */
export function toDesignDiagnostic(diagnostic: SceneDiagnostic): DesignDiagnostic {
    const result: DesignDiagnostic = { code: `scene.${diagnostic.code}`, severity: diagnostic.severity, message: diagnostic.message };
    if (diagnostic.nodeId?.startsWith('element:') === true) result.element = diagnostic.nodeId.slice('element:'.length);
    if (diagnostic.path !== undefined) result.path = diagnostic.path;
    return result;
}

export interface LoweringResult {
    workspace: DesignWorkspace;
    diagnostics: DesignDiagnostic[];
    sceneEdits: ScopedSceneEdit[];
    /** Set when the engine refused one of the steps: the workspace is then the one the steps started from. */
    refusal?: string;
}

const withTemplate = (document: SceneDocument, template: ScreenTemplate): SceneDocument => ({
    ...document,
    screenTemplates: document.screenTemplates.some(candidate => candidate.name === template.name)
        ? document.screenTemplates.map(candidate => candidate.name === template.name ? template : candidate)
        : [...document.screenTemplates, template],
});

/** Puts a screen in place of the screen of its name, declaring the template it is built on when the document does not have it. */
export function replaceScreen(workspace: DesignWorkspace, screen: Screen, template?: ScreenTemplate): DesignWorkspace {
    const needsTemplate = template !== undefined && !workspace.document.screenTemplates.some(candidate => candidate.name === template.name);
    const document = needsTemplate ? withTemplate(workspace.document, template) : workspace.document;
    return { ...workspace, document: { ...document, screens: document.screens.map(candidate => candidate.name === screen.name ? screen : candidate) } };
}

/** Applies lowered steps in order; if the engine refuses a Scene edit, nothing is applied. */
export function applyLowering(workspace: DesignWorkspace, steps: readonly LoweredStep[], context: DesignContext): LoweringResult {
    let current = workspace;
    const diagnostics: DesignDiagnostic[] = [];
    const sceneEdits: ScopedSceneEdit[] = [];
    const catalog = createDescriptorCatalog(context.descriptors);
    for (const step of steps) {
        switch (step.kind) {
            case 'sceneEdit': {
                const outcome = applyEdit(current.document, step.edit, { catalog, scope: step.scope, queryCandidates: context.queryCandidates });
                const found = outcome.diagnostics.map(toDesignDiagnostic);
                if (!outcome.applied) {
                    return { workspace, diagnostics: found, sceneEdits: [], refusal: outcome.diagnostics.map(diagnostic => diagnostic.message).join(' ') };
                }
                diagnostics.push(...found);
                sceneEdits.push({ scope: step.scope, edit: step.edit });
                current = { ...current, document: outcome.model };
                break;
            }
            case 'declareScreen':
                current = { ...current, document: { ...current.document, screens: [...current.document.screens, step.screen] } };
                break;
            case 'declareTemplate':
                current = { ...current, document: withTemplate(current.document, step.template) };
                break;
            case 'removeScreen':
                current = { ...current, document: { ...current.document, screens: current.document.screens.filter(screen => screen.name !== step.name) } };
                break;
            case 'profile':
                current = { ...current, profile: applyProfileValue(current.profile as UiProfile, step.key as DesignProfileKey, step.value) };
                break;
            case 'screenSet':
                current = { ...current, screenSet: step.change === 'add' ? addScreenToSet(current.screenSet, step.name)
                    : step.change === 'remove' ? removeScreenFromSet(current.screenSet, step.name) : moveScreenInSet(current.screenSet, step.name, step.index ?? 0) };
                break;
        }
    }
    return { workspace: current, diagnostics, sceneEdits };
}
