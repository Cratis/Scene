// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, fireEvent, render } from '@testing-library/react';
import { ExternalComponent, SceneElement } from '@cratis/scene.model';
import { EmbeddedPackageHost, PackageHostConfiguration, StandalonePackageHost, WebViewPackageHost, corePackage } from '@cratis/scene.react';
import { brandPackage } from '../brandPackage';
import { inspectionsPackage } from '../inspectionsPackage';

/**
 * A VS Code or Event Models webview renders Scene the way this spec does: a bare page that loads the public
 * packages and nothing of Studio. The three hosts must produce the same markup from the same configuration,
 * and the only way rendered content reaches the embedding host is the documented `cratis.scene.*` events.
 */
const component = (id: string, componentName: string, properties: Record<string, unknown>, slots: Record<string, SceneElement[]> = {}) =>
    ({ id, componentName, properties, slots }) as unknown as ExternalComponent;

const element = component('inspection', 'core:card', {}, {
    content: [
        component('checklist', 'Acme.Inspections:inspectionChecklist', { title: 'Before service', items: [{ id: 'fridge', label: 'Fridge below 5°C', required: true }] }),
        component('record', 'core:action', { label: 'Record inspection', command: 'RecordInspection', arguments: [{ id: 'a', name: 'site', source: 'site.id' }] }),
    ],
});

const configuration: PackageHostConfiguration = {
    bundles: [corePackage, brandPackage, inspectionsPackage],
    profile: { name: 'webview', targetPlatform: 'web', packages: ['Acme.Inspections', 'core'] },
    policy: { allowExecutableImports: false, allowNetworkAssets: false },
};

const surfaceOf = (container: HTMLElement) => {
    const surface = container.querySelector('[data-scene-host-mode]')!.cloneNode(true) as HTMLElement;
    surface.removeAttribute('data-scene-host-mode');
    return surface.outerHTML;
};

describe('when rendering one package set in a webview without Studio', () => {
    const before = new Set(Object.getOwnPropertyNames(globalThis));
    afterEach(cleanup);

    it('should have no Studio globals on the page', () =>
        Object.getOwnPropertyNames(globalThis).filter(name => /studio/i.test(name)).should.deep.equal([]));

    it('should render the same markup in the webview, embedded and standalone hosts', () => {
        const outputs = [WebViewPackageHost, EmbeddedPackageHost, StandalonePackageHost].map(Host => {
            const { container, unmount } = render(<Host configuration={configuration} element={element} dataContext={{ site: { id: 'kitchen' } }} />);
            const markup = surfaceOf(container);
            unmount();
            return markup;
        });
        outputs[0].should.contain('Fridge below 5°C');
        new Set(outputs).size.should.equal(1);
    });

    it('should reach the embedding host only through the documented command event', () => {
        const received: unknown[] = [];
        const listener = (event: Event) => received.push((event as CustomEvent).detail.arguments);
        globalThis.addEventListener('cratis.scene.command', listener);
        const { getByText } = render(<WebViewPackageHost configuration={configuration} element={element} dataContext={{ site: { id: 'kitchen' } }} />);
        fireEvent.click(getByText('Record inspection'));
        globalThis.removeEventListener('cratis.scene.command', listener);

        received.should.deep.equal([{ site: 'kitchen' }]);
        // React Testing Library sets IS_REACT_ACT_ENVIRONMENT itself; Scene adds no globals of its own.
        Object.getOwnPropertyNames(globalThis).filter(name => !before.has(name) && name !== 'IS_REACT_ACT_ENVIRONMENT').should.deep.equal([]);
    });
});
