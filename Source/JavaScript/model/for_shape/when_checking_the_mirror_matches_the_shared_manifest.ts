// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as Model from '../index';

interface ShapeManifest {
    types: Record<string, string[]>;
    enums: Record<string, string[]>;
}

const manifestPath = join(import.meta.dirname, '..', '..', '..', '..', 'scene-model-shape.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as ShapeManifest;

describe('when checking the mirror matches the shared manifest', () => {
    for (const [typeName, expectedProperties] of Object.entries(manifest.types)) {
        if (expectedProperties.length === 0) continue;

        it(`should declare the manifest properties for ${typeName}`, () => {
            const actualProperties = (Model as unknown as Record<string, string[]>)[`${typeName}PropertyNames`];
            actualProperties.should.have.members(expectedProperties);
        });
    }

    for (const [enumName, expectedMembers] of Object.entries(manifest.enums)) {
        it(`should declare the manifest members for ${enumName}`, () => {
            const enumObject = (Model as unknown as Record<string, Record<string, string>>)[enumName];
            Object.keys(enumObject).should.have.members(expectedMembers);
        });
    }
});
