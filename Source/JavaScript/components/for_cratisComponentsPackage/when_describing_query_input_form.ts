// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'vitest';
import { SceneQueryInputForm, cratisComponents, cratisComponentsPackageManifest, registerQueryIdentity, resolveExactQuery, type QueryInput } from '../index';

describe('when describing the query input form public API', () => {
    it('exports and registers the component advertised by the manifest', () => {
        expect(cratisComponentsPackageManifest.components).toContain('queryInputForm');
        expect(cratisComponents['Cratis.Components:queryInputForm']).toBe(SceneQueryInputForm);
        expect(cratisComponentsPackageManifest.description).toContain('commits explicit string inputs on submit');
        expect(registerQueryIdentity).toBeTypeOf('function');
        expect(resolveExactQuery).toBeTypeOf('function');
        const input: QueryInput = { parameter: 'projectId', type: 'string', label: 'Project identifier' };
        expect(input.type).toBe('string');
    });
});
