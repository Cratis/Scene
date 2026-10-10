// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createRoot } from 'react-dom/client';
import { ExternalComponent, SceneElement } from '@cratis/scene.model';
import { WebViewPackageHost, corePackage } from '@cratis/scene.react';
import { brandPackage } from '../brandPackage';
import { inspectionsPackage } from '../inspectionsPackage';
import { connectEmbedder } from './embedderBridge';

/**
 * A runnable embedded-host example: the custom package set (core, Acme.Brand, Acme.Inspections) rendered by
 * the WebView host, the way a VS Code or Event Models webview embeds Scene. It loads only the public Scene
 * packages, needs no Studio global, and reaches the embedder only through `cratis.scene.*` events.
 */
const component = (id: string, componentName: string, properties: Record<string, unknown>, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

const element = component('inspection', 'core:card', {}, {
    content: [
        component('checklist', 'Acme.Inspections:inspectionChecklist', { title: 'Before service', items: [{ id: 'fridge', label: 'Fridge below 5°C', required: true }] }),
        component('record', 'core:action', { label: 'Record inspection', command: 'RecordInspection', arguments: [{ id: 'a', name: 'site', source: 'site.id' }] }),
    ],
});

const post = connectEmbedder();
createRoot(document.getElementById('root')!).render(<WebViewPackageHost
    configuration={{
        bundles: [corePackage, brandPackage, inspectionsPackage],
        profile: { name: 'webview', targetPlatform: 'web', packages: ['Acme.Inspections', 'core'] },
        policy: { allowExecutableImports: false, allowNetworkAssets: false },
    }}
    element={element}
    dataContext={{ site: { id: 'kitchen' } }} />);
post({ type: 'ready' });
