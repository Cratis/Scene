// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { cleanup, render, screen } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { PackageKind } from '@cratis/scene.model';
import { corePackage, mergePackageRegistries, resolvePackageHost } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { defaultBlueprint } from '../defaultBlueprint';
import { GalleryScreenPreview, TemplatePreviewState } from '../gallery';
import { provideBrowserApis, packageBackedRegistry } from './given';

/**
 * A host (Studio's template browser, the Stage, an application) does not hand-register components: it names the packages of a UI profile and
 * `resolvePackageHost` resolves the effective set - the packages, their dependencies, their components. The vector that renders the business templates on the live
 * Stage and as a generated React application (Cratis/Stage `Verification/blueprint-templates`) lists exactly `Cratis.Blueprint.Default` in its `ui profile`; this
 * renders the same three templates through the set that profile resolves to (Cratis/Scene#95).
 */
const empty = (name: string, kind: PackageKind) => ({ manifest: { name, version: '3.0.0', kind, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] }, components: {} });
// Their components are not what a template's previews need, and the packages that provide them are not this package's dependencies.
const dependencies = [empty('Cratis.Components', PackageKind.ComponentLibrary), empty('Tailwind', PackageKind.Styling)];

const host = resolvePackageHost({
    profile: { name: 'Desktop', targetPlatform: 'web', packages: ['Cratis.Blueprint.Default'] },
    bundles: [...dependencies, primeReactPackage, defaultBlueprint],
    policy: { allowExecutableImports: true, allowNetworkAssets: false },
});

// What a host draws with: the built-in `core` components and the resolved packages' (the minimum vocabulary every host ships).
const resolved = mergePackageRegistries([corePackage, { ...corePackage, components: host.components }]);

const templates = [
    { screen: 'MasterDetail', record: 'Fabrikam', slots: ['master-header', 'customers-table', 'customer-detail'] },
    { screen: 'Dashboard', record: 'ORD-4192', slots: ['stat-revenue', 'widget-revenue', 'widget-activity'] },
    { screen: 'ProfileSettings', record: undefined, slots: ['profile-header', 'profile-identity', 'profile-actions'] },
];

describe('when previewing the templates through the host package set', () => {
    beforeEach(provideBrowserApis);
    afterEach(cleanup);

    it('should approve the profile package set without findings', () => host.diagnostics.should.deep.equal([]));
    it('should resolve the profile to the blueprint and the packages it depends on, transitively', () => host.bundles.map(bundle => bundle.manifest.name).sort().should.deep.equal(['Cratis.Blueprint.Default', 'Cratis.Components', 'PrimeReact', 'Tailwind']));
    it('should offer every shipped template to a template browser as usable', () => host.templates.filter(entry => entry.package === 'Cratis.Blueprint.Default' && !entry.compatible).map(entry => `${entry.name}: ${entry.problems.join('; ')}`).should.deep.equal([]));
    it('should resolve the very components the audited registry renders with', () => Object.keys(resolved).sort().should.deep.equal(Object.keys(packageBackedRegistry).sort()));

    for (const template of templates) {
        it(`should render the ${template.screen} template through the resolved set with no unresolved component`, () => {
            render(<PrimeReactProvider><GalleryScreenPreview screenName={template.screen} state={TemplatePreviewState.Populated} registry={resolved} /></PrimeReactProvider>);
            if (template.record) screen.getAllByText(template.record).length.should.be.greaterThan(0);
            (document.querySelector('[data-scene-unresolved-component]') === null).should.equal(true);
            // The slot contents the live Stage's vector asserts by the same ids.
            template.slots.filter(id => document.querySelector(`[data-scene-id="${id}"]`) === null).should.deep.equal([]);
        });
    }
});
