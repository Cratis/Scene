// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument, SceneElement } from '@cratis/scene.model';
import { corePackage } from '@cratis/scene.react';
import { elementNodeId, inspect, type EditingContext } from '@cratis/scene.engine';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { createScreenDocument, editingScope } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { composeEditorScreen } from '../../Templates/composeEditorScreen';
import { resolveOwnership } from '../../Templates/templateProvenance';
import { applyAllToSession, openSession } from '../../Session/EditSession';
import { resolveDesignMode } from '../resolveDesignMode';
import type { DesignModePlan, DesignModeRejection } from '../designModeTypes';

const runtime = createScreenEditorRuntime([corePackage], { name: 'test', packages: [] } as never);

// A button of an outlet of actions - the toolbar since Scene 5 (StudioIssues#1328).
export const button = (id: string, title: string, properties: Record<string, unknown> = {}) => ({ kind: 'button', id, title, ...properties });

export const toolbarScreen = (buttons = [button('b1', 'New order', { slice: 'sales.orders.PlaceOrder', emphasis: 'primary' }), button('b2', 'Cancel order'), button('b3', 'Close')]): SceneDocument => {
    const toolbar = createExternalComponent('toolbar', 'Toolbar', 'core:outletItems', { name: 'toolbar', kind: 'actions', items: buttons });
    return createScreenDocument(createPanel(LayoutItem.Stack, 'screen-root', 'Screen', [toolbar]), undefined);
};

export const context = (): EditingContext => ({ catalog: runtime.catalog, scope: editingScope(undefined) });

let counter = 0;
export const newId = () => `new-${++counter}`;

export function designModeFor(document: SceneDocument, selectedId: string | undefined, selectedItemId?: string) {
    const roots: SceneElement[] = composeEditorScreen(document, undefined).roots;
    const ownershipOf = resolveOwnership(document, roots, context());
    return resolveDesignMode({
        roots, catalog: runtime.catalog, selectedId, selectedItemId, ownershipOf, newId,
        inspect: id => inspect(document, elementNodeId(id), context()),
        startingLabels: { button: 'Button', item: 'New item' },
    });
}

// Applies what an action came to, the way the editor does: as one undo step through the session.
export function carryOut(document: SceneDocument, outcome: DesignModePlan | DesignModeRejection) {
    if ('rejected' in outcome) throw new Error(`rejected: ${outcome.rejected}`);
    const session = applyAllToSession(openSession(document), outcome.edits, context(), outcome.label);
    return { session, plan: outcome };
}

export const labelsOf = (document: SceneDocument, toolbarId = 'toolbar'): string[] => {
    const toolbar = composeEditorScreen(document, undefined).roots.flatMap(root => collect(root)).find(element => (element as { id: string }).id === toolbarId) as unknown as { properties: { items: { title: string }[] } };
    return toolbar.properties.items.map(item => item.title);
};

const collect = (element: SceneElement): SceneElement[] => [element, ...(((element as { children?: SceneElement[] }).children ?? []).flatMap(collect))];
