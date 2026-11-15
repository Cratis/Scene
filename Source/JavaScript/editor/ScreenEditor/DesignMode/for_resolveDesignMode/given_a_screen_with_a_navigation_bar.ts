// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneDocument } from '@cratis/scene.model';
import { corePackage } from '@cratis/scene.react';
import { elementNodeId, inspect, type EditingContext } from '@cratis/scene.engine';
import { createExternalComponent } from '../../Document/createExternalComponent';
import { createPanel } from '../../Document/createPanel';
import { contentSlot, createScreenDocument, editingScope } from '../../Document/studioScreen';
import { LayoutItem } from '../../Layouts/LayoutItem';
import { createScreenEditorRuntime } from '../../Runtime/screenEditorRuntime';
import { composeEditorScreen } from '../../Templates/composeEditorScreen';
import { resolveOwnership } from '../../Templates/templateProvenance';
import { resolveDesignMode } from '../resolveDesignMode';

const runtime = createScreenEditorRuntime([corePackage], { name: 'test', packages: [] } as never);

// A screen under a template whose navigation bar has one fixed item (Home) and lets screens add their own - the first is the template's, locked.
export const navigationScreen = (): SceneDocument => {
    const nav = createExternalComponent('nav', 'Navigation', 'core:navigationBar', { items: [{ id: 'home', label: 'Home', destination: { screen: 'Home' } }] });
    const own = createPanel(LayoutItem.Stack, 'screen-root', 'Screen', []);
    const base = createScreenDocument(own, 'Shell');
    return {
        ...base,
        screenTemplates: [{ name: 'Shell', slots: [{ name: contentSlot }], content: { [contentSlot]: [nav] } }],
        exposures: [{ owner: 'Shell', properties: [{ component: 'nav', path: 'items', operations: ['add', 'remove', 'reorder', 'edit-fields'] }] }],
        instanceContributions: [{
            instance: 'screen:Screen', component: 'nav', path: 'items',
            items: [
                { id: 'orders', values: { label: 'Orders', destination: { screen: 'Orders' } } },
                { id: 'customers', values: { label: 'Customers', destination: { screen: 'Customers' } } },
                { id: 'pipeline', values: { label: 'Pipeline' } },
            ],
        }],
    } as never;
};

export const navContext = (): EditingContext => ({ catalog: runtime.catalog, scope: editingScope(undefined) });

let counter = 0;
export const navNewId = () => `row-${++counter}`;

export function navigationDesignMode(document: SceneDocument, selectedId: string | undefined, selectedItemId?: string) {
    const roots = composeEditorScreen(document, undefined).roots;
    return resolveDesignMode({
        roots, catalog: runtime.catalog, selectedId, selectedItemId, ownershipOf: resolveOwnership(document, roots, navContext()), newId: navNewId,
        inspect: id => inspect(document, elementNodeId(id), navContext()),
        startingLabels: { button: 'Button', item: 'New item' },
        startingDestination: { screen: 'Home' },
    });
}
