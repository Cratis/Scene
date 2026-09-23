// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { expect } from 'vitest';

// The workspace test command runs from this package root; do not rely on Vite's virtual import.meta.url.
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
    name: string;
    peerDependencies: Record<string, string>;
    peerDependenciesMeta: Record<string, { optional?: boolean }>;
};

describe('when declaring native command form peers', () => {
    it('requires the published footer and native custom-error execution contracts', () => {
        expect(packageJson.name).toBe('@cratis/scene.components');
        expect(packageJson.peerDependencies['@cratis/components']).toBe('^4.13.0');
        expect(packageJson.peerDependencies['@cratis/arc']).toBe('^22.19.1');
        expect(packageJson.peerDependencies['@cratis/arc.react']).toBe('^22.19.1');
    });

    it('keeps Arc optional for an unbound design-time preview', () => {
        expect(packageJson.peerDependenciesMeta['@cratis/arc'].optional).toBe(true);
        expect(packageJson.peerDependenciesMeta['@cratis/arc.react'].optional).toBe(true);
    });
});
