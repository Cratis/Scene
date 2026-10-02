// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DiagnosticCode, DialogTemplate, EditingScope, EditingScopeKind, ExposedProperty, Layout, SceneDocument,
    SceneNodeKind, Screen, ScreenTemplate,
} from '@cratis/scene.model';
import { resolveScreenTemplates } from '../resolveScreenTemplates';
import { collectComponents } from './collectComponents';
import { errorDiagnostic, warningDiagnostic } from './diagnostics';
import { TemplateChain, TemplateChainLevel } from './TemplateChain';

function exposuresOf(document: SceneDocument, owner: string): ExposedProperty[] {
    return document.exposures.find(declaration => declaration.owner === owner)?.properties ?? [];
}

function level(document: SceneDocument, kind: SceneNodeKind, prefix: string, owner: Layout | ScreenTemplate | DialogTemplate | Screen): TemplateChainLevel {
    return {
        owner: owner.name,
        kind,
        instance: `${prefix}:${owner.name}`,
        elements: collectComponents(owner),
        exposures: exposuresOf(document, owner.name),
    };
}

function templateLevels(document: SceneDocument, layout: Layout, template: ScreenTemplate, chain: TemplateChain): TemplateChainLevel[] {
    const placements = resolveScreenTemplates(layout, document.screenTemplates).placements;
    const ancestry: ScreenTemplate[] = [template];

    let current = template.name;
    for (let guard = 0; guard <= document.screenTemplates.length; guard++) {
        const placement = placements.find(candidate => candidate.template === current);
        if (!placement || placement.container === layout.name) break;

        const parent = document.screenTemplates.find(candidate => candidate.name === placement.container);
        if (!parent) break;
        ancestry.unshift(parent);
        current = parent.name;
    }

    if (!placements.some(placement => placement.template === ancestry[0].name)) {
        chain.diagnostics.push(warningDiagnostic(
            DiagnosticCode.UnknownScope,
            `The template '${ancestry[0].name}' could not be placed in the layout '${layout.name}', so nothing outside it is part of the chain.`));
        return ancestry.slice(-1).map(item => level(document, SceneNodeKind.ScreenTemplate, 'template', item));
    }

    return ancestry.map(item => level(document, SceneNodeKind.ScreenTemplate, 'template', item));
}

/**
 * Assembles the chain of owners an editing scope sits inside: the layout, each template down to the one the
 * scope is in, and the scope itself.
 *
 * The same chain feeds {@link resolveEffectiveConfiguration} for the runtime and the editor, so both see the same
 * nesting. A scope that cannot be found yields an empty chain with an error diagnostic.
 *
 * @param document The document to read.
 * @param scope What is being edited.
 * @returns The chain, outermost first.
 */
export function resolveTemplateChain(document: SceneDocument, scope: EditingScope): TemplateChain {
    const chain: TemplateChain = { levels: [], diagnostics: [] };

    switch (scope.kind) {
        case EditingScopeKind.Layout: {
            const layout = document.layouts.find(candidate => candidate.name === scope.name);
            if (layout) chain.levels.push(level(document, SceneNodeKind.Layout, 'layout', layout));
            break;
        }

        case EditingScopeKind.DialogTemplate: {
            const dialog = document.dialogTemplates.find(candidate => candidate.name === scope.name);
            if (dialog) chain.levels.push(level(document, SceneNodeKind.DialogTemplate, 'dialog', dialog));
            break;
        }

        case EditingScopeKind.ScreenTemplate: {
            const template = document.screenTemplates.find(candidate => candidate.name === scope.name);
            const layout = document.layouts.find(candidate => candidate.name === scope.layout) ?? (scope.layout === undefined && document.layouts.length === 1 ? document.layouts[0] : undefined);
            if (template && layout) {
                chain.levels.push(level(document, SceneNodeKind.Layout, 'layout', layout), ...templateLevels(document, layout, template, chain));
            } else if (template) {
                chain.levels.push(level(document, SceneNodeKind.ScreenTemplate, 'template', template));
            }

            break;
        }

        default: {
            const screen = document.screens.find(candidate => candidate.name === scope.name);
            if (!screen) break;

            const layout = document.layouts.find(candidate => candidate.name === screen.layout);
            const template = screen.screenTemplate === undefined ? undefined : document.screenTemplates.find(candidate => candidate.name === screen.screenTemplate);
            if (layout) chain.levels.push(level(document, SceneNodeKind.Layout, 'layout', layout));
            if (layout && template) chain.levels.push(...templateLevels(document, layout, template, chain));
            else if (template) chain.levels.push(level(document, SceneNodeKind.ScreenTemplate, 'template', template));
            chain.levels.push(level(document, SceneNodeKind.Screen, 'screen', screen));
        }
    }

    if (chain.levels.length === 0) {
        chain.diagnostics.push(errorDiagnostic(DiagnosticCode.UnknownScope, `There is no ${scope.kind} named '${scope.name}'.`));
    }

    return chain;
}
