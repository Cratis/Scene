// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind, ScenePackage } from '@cratis/scene.model';
import { TemplateCatalogKind, describeTemplateCatalog } from '@cratis/scene.engine';
import { defaultBlueprint } from '../defaultBlueprint';

/**
 * The component libraries the templates require, at the versions this repository ships them. Declared here
 * rather than imported because this package does not depend on them; their versions are what the templates'
 * compatibility ranges are checked against, so a range that drifts from a shipped version fails here.
 */
const requiredPackage = (name: string, version: string): ScenePackage => ({
    name,
    version,
    kind: PackageKind.ComponentLibrary,
    dependencies: [],
    components: [],
    layouts: [],
    screenTemplates: [],
    dialogTemplates: [],
    themes: [],
});

describe('when describing its template catalog', () => {
    const entries = describeTemplateCatalog(
        [{ manifest: requiredPackage('PrimeReact', '11.1.0') }, { manifest: requiredPackage('Cratis.Components', '3.0.0') }, defaultBlueprint],
        '4.13.0',
    );
    const { manifest } = defaultBlueprint;

    it('should describe every template the manifest declares', () => {
        entries.filter(entry => entry.kind === TemplateCatalogKind.Layout).map(entry => entry.name).should.deep.equal(manifest.layouts);
        entries.filter(entry => entry.kind === TemplateCatalogKind.ScreenTemplate).map(entry => entry.name).should.deep.equal(manifest.screenTemplates);
        entries.filter(entry => entry.kind === TemplateCatalogKind.DialogTemplate).map(entry => entry.name).should.deep.equal(manifest.dialogTemplates);
    });

    it('should find every template compatible, attributed and licensed', () => {
        entries.filter(entry => !entry.compatible).map(entry => entry.problems).should.deep.equal([]);
    });

    it('should license every template under the package license', () => {
        entries.every(entry => entry.license === manifest.license && entry.licenseUrl === manifest.licenseUrl).should.be.true;
    });

    it('should credit the Sakai arrangement on the shell and the dashboard only', () => {
        entries.filter(entry => entry.attribution?.notice?.includes('Sakai')).map(entry => entry.name).should.deep.equal(['AppShell', 'Dashboard']);
    });

    it('should be incompatible with a Scene that predates template provenance', () => {
        describeTemplateCatalog([defaultBlueprint], '4.12.0').every(entry => !entry.compatible).should.be.true;
    });
});
