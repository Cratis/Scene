// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { corePackage } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { cratisComponentsPackage } from '@cratis/scene.components';
import { elementNodeId } from '@cratis/scene.engine';
import { SceneEditKind, type SceneEdit } from '@cratis/scene.model';
import { createExternalComponent } from '../../../Document/createExternalComponent';
import { createPanel } from '../../../Document/createPanel';
import { createScreenDocument, editingScope } from '../../../Document/studioScreen';
import { LayoutItem } from '../../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../../../Runtime/screenEditorRuntime';

export const runtime = createScreenEditorRuntime([corePackage, primeReactPackage, cratisComponentsPackage], { name: 'test', packages: ['core', 'PrimeReact', 'Cratis.Components'], targetPlatform: 'web' });
export const context = { catalog: runtime.catalog, scope: editingScope(), queryCandidates: [] };
export const original = createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen'));
const insert = (parent: string, id: string, component: string): SceneEdit => ({ kind: SceneEditKind.InsertNode, target: elementNodeId(parent), element: createExternalComponent(id, id, component) });
const property = (id: string, path: string, value: string): SceneEdit => ({ kind: SceneEditKind.SetProperty, nodeId: elementNodeId(id), path, value });
export const edits: SceneEdit[] = [
    { kind: SceneEditKind.InsertNode, target: elementNodeId('screen-root'), element: createPanel(LayoutItem.Stack, 'draft-stack', 'Details') },
    insert('draft-stack', 'draft-title', 'core:title'),
    property('draft-title', 'text', 'Customer details'),
    { kind: SceneEditKind.InsertNode, target: elementNodeId('draft-stack'), element: createPanel(LayoutItem.Row, 'draft-row', 'Name') },
    insert('draft-row', 'draft-label', 'core:text'),
    property('draft-label', 'text', 'Name'),
    insert('draft-row', 'draft-input', 'PrimeReact:inputText'),
    property('draft-input', 'placeholder', 'Customer name'),
    property('draft-input', 'ariaLabel', 'Name'),
    insert('draft-stack', 'draft-button', 'core:button'),
    property('draft-button', 'label', 'Save'),
];
export const answer = JSON.stringify({ reply: 'Layout only; inputs and buttons do not run commands or forms. Query bindings unsupported.', edits });
