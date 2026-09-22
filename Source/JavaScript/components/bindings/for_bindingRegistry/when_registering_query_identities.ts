// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'vitest';
import { clearBindings, registerQuery, registerQueryIdentity, registeredQueryNames, resolveExactQuery, resolveQuery, unregisterQueryIdentity } from '../bindingRegistry';

class First {}
class Replacement {}

describe('when opting into collision-aware query identities', () => {
    beforeEach(() => clearBindings());
    afterEach(() => clearBindings());

    it('replaces the same source identity on hot reload', () => {
        registerQueryIdentity('Lookup', 'source/Lookup', First);
        registerQueryIdentity('Lookup', 'source/Lookup', Replacement);
        expect(resolveExactQuery('Lookup')).toBe(Replacement);
        expect(resolveQuery('Lookup')).toBe(Replacement);
        expect(registeredQueryNames()).toEqual(['Lookup']);
    });

    it('counts different source identities even for the same constructor', () => {
        registerQueryIdentity('Lookup', 'one/Lookup', First);
        registerQueryIdentity('Lookup', 'two/Lookup', First);
        expect(resolveExactQuery('Lookup')).toBe('ambiguous');
        expect(resolveQuery('Lookup')).toBeUndefined();
        expect(registeredQueryNames()).toEqual(['Lookup']);
        unregisterQueryIdentity('Lookup', 'one/Lookup');
        expect(resolveExactQuery('Lookup')).toBe(First);
        expect(resolveQuery('Lookup')).toBe(First);
        unregisterQueryIdentity('Lookup', 'two/Lookup');
        expect(resolveExactQuery('Lookup')).toBeUndefined();
        expect(resolveQuery('Lookup')).toBeUndefined();
        expect(registeredQueryNames()).toEqual([]);
    });

    it('keeps legacy replacement authoritative while exact resolution counts mixed candidates', () => {
        registerQuery('Lookup', First);
        registerQuery('Lookup', Replacement);
        expect(resolveQuery('Lookup')).toBe(Replacement);
        expect(resolveExactQuery('Lookup')).toBe(Replacement);
        registerQueryIdentity('Lookup', 'source/Lookup', First);
        expect(resolveQuery('Lookup')).toBe(Replacement);
        expect(resolveExactQuery('Lookup')).toBe('ambiguous');
    });

    it('bridges a unique identity to legacy consumers with exact case-sensitive names and clears both maps', () => {
        registerQueryIdentity('Lookup', 'source/Lookup', First);
        expect(resolveQuery('Lookup')).toBe(First);
        expect(resolveQuery('lookup')).toBeUndefined();
        expect(resolveExactQuery('lookup')).toBeUndefined();
        clearBindings();
        expect(resolveQuery('Lookup')).toBeUndefined();
        expect(resolveExactQuery('Lookup')).toBeUndefined();
        expect(registeredQueryNames()).toEqual([]);
    });

    it('lists the sorted union without duplicates, retaining legacy names after identity removal', () => {
        registerQueryIdentity('Zed', 'source/Zed', First);
        registerQueryIdentity('Lookup', 'source/Lookup', First);
        registerQuery('Lookup', Replacement);
        registerQuery('Alpha', First);
        expect(registeredQueryNames()).toEqual(['Alpha', 'Lookup', 'Zed']);
        unregisterQueryIdentity('Lookup', 'source/Lookup');
        unregisterQueryIdentity('Zed', 'source/Zed');
        unregisterQueryIdentity('Missing', 'source/Missing');
        expect(registeredQueryNames()).toEqual(['Alpha', 'Lookup']);
        expect(resolveQuery('Lookup')).toBe(Replacement);
        expect(resolveExactQuery('Lookup')).toBe(Replacement);
    });

    it('gives an existing legacy registration precedence even over multiple identities and later replacements', () => {
        registerQueryIdentity('Lookup', 'one/Lookup', First);
        registerQueryIdentity('Lookup', 'two/Lookup', First);
        registerQuery('Lookup', First);
        registerQuery('Lookup', Replacement);
        registerQueryIdentity('Lookup', 'one/Lookup', Replacement);
        expect(resolveQuery('Lookup')).toBe(Replacement);
        expect(resolveExactQuery('Lookup')).toBe('ambiguous');
    });
});
