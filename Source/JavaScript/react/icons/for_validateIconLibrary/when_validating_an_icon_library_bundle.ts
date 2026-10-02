// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { ScenePackageBundle, mergeIconAdapters, validatePackageBundle } from '../../index';

const manifest: ScenePackage = {
    name: 'acme.icons',
    version: '1.0.0',
    kind: PackageKind.IconLibrary,
    dependencies: [],
    components: [],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
    iconLibrary: { variants: [], renderers: ['react'] },
};

const iconLibrary = {
    catalog: { library: 'acme.icons', loadEntries: async () => [] },
    adapter: { library: 'acme.icons', loadGlyph: () => undefined },
};

describe('when validating an icon library bundle', () => {
    it('should accept a bundle that matches its manifest', () => validatePackageBundle({ manifest, components: {}, iconLibrary }).should.be.empty);

    it('should report a declared library with no catalog or adapter', () => {
        const problems = validatePackageBundle({ manifest, components: {} } as ScenePackageBundle);
        problems.should.have.lengthOf(1);
        problems[0].should.contain('provides no catalog or adapter');
    });

    it('should report a catalog and adapter the manifest does not declare', () => {
        const problems = validatePackageBundle({ manifest: { ...manifest, kind: PackageKind.ComponentLibrary, iconLibrary: undefined }, components: {}, iconLibrary });
        problems.should.have.lengthOf(1);
        problems[0].should.contain('does not declare');
    });

    it('should report an icon library without iconLibrary metadata', () => {
        const problems = validatePackageBundle({ manifest: { ...manifest, iconLibrary: undefined }, components: {} } as ScenePackageBundle);
        problems.some((problem) => problem.includes('declares no iconLibrary metadata')).should.be.true;
    });

    it('should report an adapter for a different library', () => {
        const problems = validatePackageBundle({ manifest, components: {}, iconLibrary: { ...iconLibrary, adapter: { ...iconLibrary.adapter, library: 'other' } } });
        problems.should.have.lengthOf(1);
        problems[0].should.contain("'other'");
    });

    it('should report a React adapter the manifest does not list a renderer for', () => {
        const problems = validatePackageBundle({ manifest: { ...manifest, iconLibrary: { variants: [], renderers: ['swiftui'] } }, components: {}, iconLibrary });
        problems.should.have.lengthOf(1);
        problems[0].should.contain("'react'");
    });

    it('should merge the adapters of several bundles into one registry', () => {
        const other = { manifest: { ...manifest, name: 'beta.icons' }, components: {}, iconLibrary: { catalog: { library: 'beta.icons', loadEntries: async () => [] }, adapter: { library: 'beta.icons', loadGlyph: () => undefined } } };
        mergeIconAdapters([{ manifest, components: {}, iconLibrary }, other]).libraries.should.deep.equal(['acme.icons', 'beta.icons']);
    });
});
