// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { componentRegistryKey, validatePackageBundle } from '@cratis/scene.react';
import {
    blueprintPreviewBundles,
    blueprintPreviewCatalog,
    blueprintPreviewComponentCatalog,
    blueprintPreviewRegistry,
    blueprintPreviewThemes,
    previewableBlueprints,
} from '../blueprintPreviewCatalog';

describe('when assembling the catalog', () => {
    it('should carry every package Studio has loaded', () => {
        blueprintPreviewCatalog
            .map(scenePackage => scenePackage.name)
            .should.deep.equal([
                'core',
                'Tailwind',
                'PrimeReact',
                'Cratis.Components',
                'Cratis.Blueprint.Default',
                'Cratis.Blueprint.Components',
                'Cratis.Blueprint.Approvals',
                'Cratis.Blueprint.Bookings',
                'Cratis.Blueprint.Catalog',
                'Cratis.Blueprint.Contracts',
                'Cratis.Blueprint.Crm',
                'Cratis.Blueprint.CustomerPortal',
                'Cratis.Blueprint.Invoicing',
                'Cratis.Blueprint.Orders',
                'Cratis.Blueprint.Ticketing',
                'Cratis.Blueprint.Vendors',
                'Cratis.Blueprint.WorkOrders',
                'Cratis.Icons.Lucide',
            ]);
    });

    it('should offer both blueprints to preview', () => {
        previewableBlueprints
            .map(bundle => bundle.manifest.name)
            .should.deep.equal(['Cratis.Blueprint.Default', 'Cratis.Blueprint.Components']);
    });

    it('should let a blueprint depend on another blueprint rather than ship a rival shell', () => {
        const components = blueprintPreviewCatalog.find(scenePackage => scenePackage.name === 'Cratis.Blueprint.Components')!;
        components.layouts.should.be.empty;
        components.dependencies.map(dependency => dependency.name).should.contain('Cratis.Blueprint.Default');
    });

    it('should take each package component names from its own manifest', () => {
        for (const scenePackage of blueprintPreviewCatalog) {
            blueprintPreviewComponentCatalog[scenePackage.name].should.equal(scenePackage.components);
        }
    });

    it('should merge every package registry, keyed by package', () => {
        blueprintPreviewRegistry.should.have.property(componentRegistryKey('core', 'text'));
        blueprintPreviewRegistry.should.have.property(componentRegistryKey('PrimeReact', 'dataTable'));
        blueprintPreviewRegistry.should.have.property(componentRegistryKey('Cratis.Components', 'dataTable'));
        blueprintPreviewRegistry.should.have.property(componentRegistryKey('Cratis.Blueprint.Default', 'appShell'));
    });

    it('should keep both packages that declare the same bare name', () => {
        blueprintPreviewRegistry[componentRegistryKey('PrimeReact', 'dataTable')].should.not.equal(
            blueprintPreviewRegistry[componentRegistryKey('Cratis.Components', 'dataTable')],
        );
    });

    it('should offer the themes every loaded package ships', () => {
        blueprintPreviewThemes.map(theme => theme.name).should.contain('Scene Default Light');
        blueprintPreviewThemes.map(theme => theme.name).should.contain('Scene Default Dark');
        blueprintPreviewThemes.length.should.be.greaterThan(2);
    });

    it('should register an implementation for everything the manifests declare', () => {
        for (const bundle of blueprintPreviewBundles) {
            validatePackageBundle(bundle).should.be.empty;
        }
    });
});
