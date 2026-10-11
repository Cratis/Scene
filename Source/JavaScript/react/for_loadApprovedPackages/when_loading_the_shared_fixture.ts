// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApprovedPackageSet } from '../packages/ApprovedPackageSet';
import { loadApprovedPackages } from '../packages/loadApprovedPackages';
import { ScenePackageBundle } from '../packages/ScenePackageBundle';

// The canonical document `Cratis.Scene.Engine.Packages.ApprovedPackageSetJson` writes in .NET, loaded as the CLI and
// Stage hand it to a React host.
const fixture = JSON.parse(readFileSync(join(__dirname, '../../../../approved-package-set-fixture.json'), 'utf8')) as ApprovedPackageSet;

describe('when loading the shared fixture', () => {
    it('should load every package the .NET writer declared against bundles matching those declarations', async () => {
        const importers = Object.fromEntries(fixture.packages.map(({ manifest, module }) => [
            module.npm,
            async () => ({ [module.export]: {
                manifest: { ...manifest, module: undefined },
                components: Object.fromEntries(manifest.components.map(component => [`${manifest.name}:${component}`, () => null])),
            } as unknown as ScenePackageBundle }),
        ]));

        const result = await loadApprovedPackages(fixture, importers, { allowExecutableImports: true });

        result.diagnostics.should.deep.equal([]);
        result.bundles.map(bundle => bundle.manifest.name).should.deep.equal(['Acme.Charts', 'Zeta.Widgets']);
    });
});
