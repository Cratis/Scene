// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, type SceneDocument, type SceneElement } from '@cratis/scene.model';
import { corePackage } from '@cratis/scene.react';
import { cratisComponentsPackage } from '@cratis/scene.components';
import type { EditingContext } from '@cratis/scene.engine';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { contentSlot, createScreenDocument, editingScope, screenName } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { createSceneStructureAdapter } from '../../Selection/sceneStructureAdapter';
import { composeEditorScreen } from '../../Templates/composeEditorScreen';
import { resolveOwnership } from '../../Templates/templateProvenance';
import { computeDropRegions } from '../../DropRegions/computeDropRegions';
import { surfaceArrangementOfRoot } from '../../Selection/surfaceArrangementOfRoot';
import { authoredRoot } from '../../Document/studioScreen';

export const runtime = createScreenEditorRuntime([corePackage, cratisComponentsPackage], { name: 'test', packages: [] } as never);

/** A screen of its own - a stack holding an empty row and a button - under a template that contributes a navigation bar. */
export function composedScreen(): SceneDocument {
    const nav = createExternalComponent('nav', 'Navigation', 'navigationBar');
    const own = createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [
        createPanel(LayoutItem.Row, 'row', 'Row'),
        createPanel(LayoutItem.Canvas, 'canvas', 'Canvas'),
        createExternalComponent('button', 'Save', 'button', { label: 'Save' }),
    ]);
    const base = createScreenDocument(own, 'Shell');
    return { ...base, screenTemplates: [{ name: 'Shell', slots: [{ name: contentSlot }], content: { [contentSlot]: [nav] } }] };
}

export const screenContext = (): EditingContext => ({ catalog: runtime.catalog, scope: editingScope(undefined) });
export const templateContext = (): EditingContext => ({ catalog: runtime.catalog, scope: { kind: EditingScopeKind.ScreenTemplate, name: 'Shell', layout: 'StudioScreen' } });

export function describeComposition(document: SceneDocument, context: EditingContext, template?: string) {
    const composition = composeEditorScreen(document, template);
    const ownershipOf = resolveOwnership(document, composition.roots, context);
    const adapter = createSceneStructureAdapter(ownershipOf);
    const regions = computeDropRegions<SceneElement>(composition.roots, surfaceArrangementOfRoot(authoredRoot(document, template)), adapter).filter(region => region.containerId !== null);
    return { composition, ownershipOf, adapter, regions };
}

export const screenScopeName = screenName;
