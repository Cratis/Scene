// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { render } from '@testing-library/react';
import { PrimeReactProvider } from '@primereact/core';
import { PackageKind } from '@cratis/scene.model';
import { ScenePackageBundle, corePackage, resolvePackageHost } from '@cratis/scene.react';
import { primeReactPackage } from '@cratis/scene.primereact';
import { defaultBlueprint } from '../defaultBlueprint';
import { GalleryScreenPreview } from '../gallery/GalleryScreenPreview';
import { TemplatePreviewState } from '../gallery/TemplatePreviewState';
import { provideBrowserApis } from './given';

// The component library is enough for this host contract: these templates never ask for its composites.
const components: ScenePackageBundle = {
    manifest: {
        name: 'Cratis.Components', version: '3.0.0', kind: PackageKind.ComponentLibrary, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [],
    },
    components: {},
};

function hostWith(packages: string[]) {
    const tailwind: ScenePackageBundle = {
        manifest: { name: 'Tailwind', version: '3.0.0', kind: PackageKind.Styling, dependencies: [], components: [], layouts: [], screenTemplates: [], dialogTemplates: [], themes: [] },
        components: {},
    };
    return resolvePackageHost({
        profile: { name: 'App', targetPlatform: 'web', packages },
        bundles: [corePackage, components, defaultBlueprint, ...(packages.includes('PrimeReact') ? [tailwind, primeReactPackage] : [])],
        policy: { allowExecutableImports: false, allowNetworkAssets: false },
        sceneVersion: '4.13.0',
    });
}

/** A host never imports or provides the optional widget package merely because it approved the shell. */
describe('when previewing the templates through the host package set', () => {
    beforeEach(provideBrowserApis);
    describe('and the profile names only the default blueprint', () => {
        const host = hostWith(['Cratis.Blueprint.Default']);

        it('should resolve without the optional widget bundle being approved', () => {
            host.diagnostics.should.deep.equal([]);
            host.bundles.map(bundle => bundle.manifest.name).should.deep.equal(['Cratis.Components', 'Cratis.Blueprint.Default']);
        });

        it('should offer compatible shell and foundation templates', () => {
            const names = ['AppShell', 'FullPage', 'ListScreen', 'RecordPage', 'QuickCreateDialog'];
            host.templates.filter(template => names.includes(template.name)).map(template => template.compatible).should.deep.equal(names.map(() => true));
        });

        it('should report optional widget templates as incompatible rather than activate their package', () => {
            host.templates.find(template => template.name === 'Dashboard')!.compatible.should.equal(false);
        });

        for (const name of ['ListScreen', 'RecordPage', 'LoginScreen']) {
            it(`should render ${name} and its shell without a widget provider or unresolved components`, () => {
                render(<GalleryScreenPreview screenName={name} registry={{ ...corePackage.components, ...host.components }} />);
                document.querySelectorAll('.scene-unresolved-component').length.should.equal(0);
                document.querySelectorAll('[data-scene-id="topbar"], .layout-full-page').length.should.be.greaterThan(0);
            });
        }
    });

    describe('and the profile opts into the widget package for a borrowing template', () => {
        const host = hostWith(['PrimeReact', 'Cratis.Blueprint.Default']);

        it('should resolve the optional package and its templates', () => {
            host.diagnostics.should.deep.equal([]);
            host.bundles.some(bundle => bundle.manifest.name === 'PrimeReact').should.equal(true);
            host.templates.find(template => template.name === 'Dashboard')!.compatible.should.equal(true);
        });

        for (const name of ['CrudList', 'MasterDetail', 'Dashboard', 'ProfileSettings', 'UserManagement']) {
            it(`should render ${name} through its declared widget package`, () => {
                render(<PrimeReactProvider><GalleryScreenPreview screenName={name} registry={{ ...corePackage.components, ...host.components }} state={TemplatePreviewState.Populated} /></PrimeReactProvider>);
                document.querySelectorAll('.scene-unresolved-component').length.should.equal(0);
            });
        }
    });
});
