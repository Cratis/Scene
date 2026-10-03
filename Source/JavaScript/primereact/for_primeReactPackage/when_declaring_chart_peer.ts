// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface PackageManifest {
    peerDependencies: Record<string, string>;
    peerDependenciesMeta: Record<string, { optional?: boolean }>;
}

describe('when declaring the chart renderer dependency', () => {
    const packageJson = JSON.parse(readFileSync(resolve(import.meta.dirname, '..', 'package.json'), 'utf8')) as PackageManifest;

    it('should require a compatible Chart.js peer', () => {
        packageJson.peerDependencies['chart.js'].should.equal('^4.5.1');
    });

    it('should leave installing it to the host, so hosts that never render a chart can omit it', () => {
        (packageJson.peerDependenciesMeta['chart.js']?.optional === true).should.be.true;
    });
});
