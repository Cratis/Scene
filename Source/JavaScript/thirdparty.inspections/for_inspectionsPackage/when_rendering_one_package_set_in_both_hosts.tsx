// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render } from '@testing-library/react';
import { ExternalComponent, HorizontalAlignment, SceneElement, VerticalAlignment, Visibility } from '@cratis/scene.model';
import { EmbeddedPackageHost, PackageHostConfiguration, ScenePackageBundle, StandalonePackageHost, corePackage, resolvePackageHost } from '@cratis/scene.react';
import { brandPackage } from '../brandPackage';
import { inspectionsPackage } from '../inspectionsPackage';

const neutral = {
    visibility: Visibility.Visible, isEnabled: true, opacity: 1, size: {}, zIndex: 0, minimumSize: {}, maximumSize: {},
    margin: { left: 0, top: 0, right: 0, bottom: 0 }, horizontalAlignment: HorizontalAlignment.Stretch, verticalAlignment: VerticalAlignment.Stretch,
};
const component = (id: string, componentName: string, properties: Record<string, unknown>, slots: Record<string, SceneElement[]> = {}) =>
    ({ ...neutral, id, name: id, componentName, properties, slots }) as unknown as ExternalComponent;

/** A core card holding the third-party checklist - bare names, as an authored document carries them. */
const element = component('inspection', 'core:card', {}, {
    content: [
        component('heading', 'core:text', { text: 'Kitchen inspection' }),
        component('checklist', 'Acme.Inspections:inspectionChecklist', {
            title: 'Before service',
            items: [{ id: 'fridge', label: 'Fridge below 5°C', required: true }, { id: 'exits', label: 'Fire exits clear', required: true }],
        }),
    ],
});

const configuration = (bundles: ScenePackageBundle[]): PackageHostConfiguration => ({
    bundles,
    profile: { name: 'web', targetPlatform: 'web', packages: ['Acme.Inspections', 'core'] },
    policy: { allowExecutableImports: false, allowNetworkAssets: false },
});

const customSet = [corePackage, brandPackage, inspectionsPackage];

/** The host surface with only the attribute that names the host mode removed. */
function renderedIn(Host: typeof EmbeddedPackageHost, bundles: ScenePackageBundle[]): string {
    const { container, unmount } = render(<Host configuration={configuration(bundles)} element={element} />);
    const surface = container.querySelector('[data-scene-host-mode]')!.cloneNode(true) as HTMLElement;
    surface.removeAttribute('data-scene-host-mode');
    unmount();
    return surface.outerHTML;
}

describe('when rendering one custom package set in the embedded and the standalone host', () => {
    afterEach(cleanup);

    it('should approve the set without diagnostics and with one owner per runtime singleton', () => {
        const host = resolvePackageHost(configuration(customSet));
        host.diagnostics.should.deep.equal([]);
        host.bundles.map(bundle => bundle.manifest.name).should.deep.equal(['core', 'Acme.Brand', 'Acme.Inspections']);
        const owners = host.bundles.flatMap(bundle => (bundle.manifest.runtimeSingletons ?? []).map(singleton => [singleton, bundle.manifest.name]));
        new Set(owners.map(([singleton]) => singleton)).size.should.equal(owners.length);
    });

    it('should render identical markup in both hosts', () => {
        const embedded = renderedIn(EmbeddedPackageHost, customSet);
        embedded.should.contain('Kitchen inspection');
        embedded.should.contain('Fridge below 5°C');
        embedded.should.contain('data-scene-package-asset="styles/acme-brand.css"');
        renderedIn(StandalonePackageHost, customSet).should.equal(embedded);
    });

    it('should preload the package font in each host', () => {
        for (const Host of [EmbeddedPackageHost, StandalonePackageHost]) {
            const { unmount } = render(<Host configuration={configuration(customSet)} element={element} />);
            // React hoists font preloads into the document head.
            [...document.head.querySelectorAll('[data-scene-package-font]')].map(link => link.getAttribute('href')).should.deep.equal(['fonts/acme-sans.woff2']);
            unmount();
        }
    });

    it('should render deterministically, whatever order the bundles are approved in', () => {
        const first = renderedIn(StandalonePackageHost, customSet);
        renderedIn(StandalonePackageHost, customSet).should.equal(first);
        renderedIn(StandalonePackageHost, [...customSet].reverse()).should.equal(first);
        renderedIn(EmbeddedPackageHost, [inspectionsPackage, corePackage, brandPackage]).should.equal(first);
    });

    it('should block both hosts the same way when a second package claims a runtime singleton', () => {
        const impostor: ScenePackageBundle = {
            ...brandPackage,
            manifest: { ...brandPackage.manifest, name: 'Other.Brand', runtimeSingletons: ['@acme/brand-tokens'] },
        };
        const bundles = [...customSet, impostor];
        const blocked = { ...configuration(bundles), profile: { ...configuration(bundles).profile, packages: ['Acme.Inspections', 'Other.Brand', 'core'] } };

        resolvePackageHost(blocked).diagnostics.should.deep.equal(["Runtime singleton '@acme/brand-tokens' is provided by both 'Other.Brand' and 'Acme.Brand'"]);
        const outputs = [EmbeddedPackageHost, StandalonePackageHost].map(Host => {
            const { container, unmount } = render(<Host configuration={blocked} element={element} />);
            const surface = container.querySelector('[data-scene-host-mode]')!;
            const result = [surface.getAttribute('data-scene-host-blocked'), surface.querySelector('ul')!.textContent, container.textContent!.includes('Fridge')];
            unmount();
            return result;
        });
        outputs[0].should.deep.equal(['true', "Runtime singleton '@acme/brand-tokens' is provided by both 'Other.Brand' and 'Acme.Brand'", false]);
        outputs[1].should.deep.equal(outputs[0]);
    });
});
