// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { ExternalComponent, PackageKind, SceneElement } from '@cratis/scene.model';
import { ApprovedPackageSet } from '../packages/ApprovedPackageSet';
import { EmbeddedPackageHost } from '../packages/EmbeddedPackageHost';
import { resolveApprovedPackageHost } from '../packages/loadApprovedPackages';
import { ResolvedPackageHost } from '../packages/PackageHostConfiguration';
import { ScenePackageBundle } from '../packages/ScenePackageBundle';
import { WebViewPackageHost } from '../packages/WebViewPackageHost';

// The canonical approved package set document the CLI, Stage and a React host share - the one `cratis render --package-set` and
// `cratis run --package-set` take - rendered in the embedded and the webview hosts, not only in a standalone application.
const fixture = JSON.parse(readFileSync(join(__dirname, '../../../../approved-package-set-fixture.json'), 'utf8')) as ApprovedPackageSet;
const acme = fixture.packages.find(_ => _.manifest.name === 'Acme.Charts')!;

const element = { id: 'salesChart', componentName: 'Acme.Charts:chart', properties: { title: 'Sales by week' }, slots: {} } as unknown as ExternalComponent;

function Chart({ element: rendered }: { element: ExternalComponent }) {
    return <figure data-acme-chart={rendered.id}>{String(rendered.properties.title)}</figure>;
}

const importers = Object.fromEntries(fixture.packages.map(({ manifest, module }) => [
    module.npm,
    async () => ({ [module.export]: {
        manifest: { ...manifest, module: undefined },
        components: Object.fromEntries(manifest.components.map(component => [`${manifest.name}:${component}`, manifest.name === 'Acme.Charts' ? Chart : () => null])),
    } as unknown as ScenePackageBundle }),
]));

// The package Acme.Charts declares as a dependency: a package the host ships, as the Stage frontend ships Cratis.Components.
const shipped = {
    manifest: { name: 'Cratis.Components', version: '4.1.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [], assets: [] },
    components: {},
} as unknown as ScenePackageBundle;

const profile = { name: 'web', targetPlatform: 'web', packages: ['Cratis.Components', 'Acme.Charts'] } as never;

function host(allowExecutableImports: boolean): Promise<ResolvedPackageHost> {
    return resolveApprovedPackageHost({ profile, policy: { allowExecutableImports, allowNetworkAssets: false }, bundles: [shipped], packageSet: fixture, importers });
}

describe('when rendering an approved package set', () => {
    it('should render a component of an approved package in the embedded host', async () => {
        const resolved = await host(true);
        resolved.diagnostics.should.deep.equal([]);
        resolved.blocked.should.equal(false);

        render(<EmbeddedPackageHost configuration={{ profile, policy: { allowExecutableImports: true, allowNetworkAssets: false }, bundles: resolved.bundles }} element={element as unknown as SceneElement} />);

        screen.getByText('Sales by week').closest('figure')!.getAttribute('data-acme-chart')!.should.equal('salesChart');
        document.querySelector('[data-scene-host-mode="embedded"]')!.getAttribute('data-scene-host-blocked')!.should.equal('false');
    });

    it('should render the same component in the constrained webview host', async () => {
        const resolved = await host(true);

        render(<WebViewPackageHost configuration={{ profile, policy: { allowExecutableImports: true, allowNetworkAssets: false }, bundles: resolved.bundles }} element={element as unknown as SceneElement} />);

        screen.getByText('Sales by week').closest('figure')!.getAttribute('data-acme-chart')!.should.equal('salesChart');
        document.querySelector('[data-scene-host-mode="webView"]')!.getAttribute('data-scene-host-blocked')!.should.equal('false');
    });

    it('should not run the package when the host policy forbids executable imports', async () => {
        const resolved = await host(false);

        resolved.blocked.should.equal(true);
        resolved.diagnostics.some(diagnostic => diagnostic.includes(`'${acme.manifest.name}' brings executable code from '${acme.module.npm}'`)).should.equal(true);
        resolved.components.should.deep.equal({});
    });

    it('should block the embedded host rather than render a profile with a package that does not match its declaration', async () => {
        const mismatched = { ...importers, [acme.module.npm]: async () => ({ [acme.module.export]: { manifest: { ...acme.manifest, version: '9.9.9', module: undefined }, components: { 'Acme.Charts:chart': Chart } } as unknown as ScenePackageBundle }) };
        const resolved = await resolveApprovedPackageHost({ profile, policy: { allowExecutableImports: true, allowNetworkAssets: false }, bundles: [shipped], packageSet: fixture, importers: mismatched });

        resolved.blocked.should.equal(true);
        render(<EmbeddedPackageHost configuration={{ profile, policy: { allowExecutableImports: false, allowNetworkAssets: false }, bundles: resolved.bundles }} element={element as unknown as SceneElement} />);
        (screen.queryByText('Sales by week') === null).should.equal(true);
    });
});
