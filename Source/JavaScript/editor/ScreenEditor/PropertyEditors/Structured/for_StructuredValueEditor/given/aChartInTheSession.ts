// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EditingScopeKind, type InspectedProperty, type SceneDocument } from '@cratis/scene.model';
import { elementNodeId, inspect, type EditingContext } from '@cratis/scene.engine';
import { blueprintPreviewBundles } from '../../../../../BlueprintPreview/blueprintPreviewCatalog';
import { createExternalComponent } from '../../../../Document/createExternalComponent';
import { createPanel } from '../../../../Document/createPanel';
import { contentSlot, createScreenDocument, screenName } from '../../../../Document/studioScreen';
import { LayoutItem } from '../../../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../../../../Runtime/screenEditorRuntime';
import { applyToSession, openSession, type ScreenEditSession } from '../../../../Session/EditSession';
import { editForValue } from '../../../../Properties/propertyEdits';

const runtime = createScreenEditorRuntime(blueprintPreviewBundles, { name: 'json', packages: blueprintPreviewBundles.map(bundle => bundle.manifest.name) } as never);

export const editingScreen: EditingContext = { catalog: runtime.catalog, scope: { kind: EditingScopeKind.Screen, name: screenName } };

// The real engine, the real PrimeReact package's descriptors: a chart, whose `data` and `options` are JSON properties.
export const documentWithAChart = (): SceneDocument =>
    createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root', [createExternalComponent('chart', 'Chart', 'chart', {})]));

// The same chart held by a screen template that exposes nothing, so a screen using the template may not change it.
export const documentWithAChartInATemplate = (): SceneDocument => {
    const base = createScreenDocument(createPanel(LayoutItem.Stack, 'root', 'Root'), 'Shell');
    const chart = createExternalComponent('chart', 'Chart', 'chart', { data: { labels: ['a'] } });
    return { ...base, screenTemplates: [{ name: 'Shell', slots: [{ name: contentSlot }], content: { [contentSlot]: [chart] } }] };
};

export const inspectProperty = (session: ScreenEditSession, path: string): InspectedProperty =>
    inspect(session.document, elementNodeId('chart'), editingScreen)!.properties.find(property => property.descriptor.path === path)!;

// What the inspector does when the author commits a value: the edit for it, applied through the editing session.
export const setThroughTheSession = (session: ScreenEditSession, path: string, value: unknown): ScreenEditSession =>
    applyToSession(session, editForValue('chart', inspectProperty(session, path), value), editingScreen, 'Edit');

export const openChart = (): ScreenEditSession => openSession(documentWithAChart());
