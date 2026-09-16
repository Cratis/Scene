// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'vitest';
import { componentRegistryKey } from '@cratis/scene.react';
import { cratisComponents, cratisComponentsPackageName } from '../cratisComponents';
import { cratisComponentsPackageManifest } from '../cratisComponentsPackage';
import { SceneSingleResult } from '../data/SceneSingleResult';

describe('when describing the single result view', () => {
    it('registers the same component advertised by the manifest', () => {
        expect(cratisComponentsPackageManifest.components).toContain('singleResult');
        expect(cratisComponents[componentRegistryKey(cratisComponentsPackageName, 'singleResult')]).toBe(SceneSingleResult);
    });

    it('describes an explicitly enabled read-only own-field capability', () => {
        expect(cratisComponentsPackageManifest.description).toContain('read-only scalar own resultField');
        expect(cratisComponentsPackageManifest.description).toContain('enabled: true');
    });
});
