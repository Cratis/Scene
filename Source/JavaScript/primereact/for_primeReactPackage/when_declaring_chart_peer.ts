// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';

interface PackageManifest {
    peerDependencies: Record<string, string>;
    peerDependenciesMeta: Record<string, { optional?: boolean }>;
}

describe('when declaring the chart renderer dependency', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as PackageManifest;

    it('should require a compatible Chart.js peer', () => {
        packageJson.peerDependencies['chart.js'].should.equal('^4.5.1');
    });

    it('should let hosts that do not render charts omit it', () => {
        (packageJson.peerDependenciesMeta['chart.js']?.optional === true).should.be.true;
    });
});
