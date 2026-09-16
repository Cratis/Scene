// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { expect } from 'vitest';
import { QueryFor, ObservableQueryFor } from '@cratis/arc/queries';
import { Command } from '@cratis/arc/commands';
import type { ComponentProps } from 'react';
import type { DataTableForQuery, DataTableForObservableQuery } from '@cratis/components/DataTables';
import type { CommandDialog } from '@cratis/components/CommandDialog';
import { requireArcProxy } from '../requireArcProxy';
import { registerQuery, resolveQuery, clearBindings } from '../bindingRegistry';
import { Snapshot, Live, Save } from './NativeProxies';

describe('when validating a proxy at the lazy Arc boundary', () => {
    afterEach(clearBindings);

    it('should preserve native constructors without constructing them and satisfy public component props', () => {
        const query: ComponentProps<typeof DataTableForQuery>['query'] = requireArcProxy(Snapshot, QueryFor<object, object>, 'query');
        const observable: ComponentProps<typeof DataTableForObservableQuery>['query'] = requireArcProxy(Live, ObservableQueryFor<object, object>, 'observable query');
        const command: ComponentProps<typeof CommandDialog>['command'] = requireArcProxy(Save, Command<object, object>, 'command');
        expect(query).toBe(Snapshot);
        expect(observable).toBe(Live);
        expect(command).toBe(Save);
    });

    it('should reject wrong kinds rather than perform an observable query as a snapshot', () => {
        expect(() => requireArcProxy(Live, QueryFor<object, object>, 'query')).toThrow('Invalid query binding');
        expect(() => requireArcProxy(Snapshot, ObservableQueryFor<object, object>, 'observable query')).toThrow('Invalid observable query binding');
        expect(() => requireArcProxy(Snapshot, Command<object, object>, 'command')).toThrow('Invalid command binding');
        expect(() => requireArcProxy(Save, QueryFor<object, object>, 'query')).toThrow('Invalid query binding');
    });

    it('should preserve arbitrary constructor registration but reject it at an Arc adapter', () => {
        class Arbitrary { constructor(readonly input: string) {} }
        registerQuery('arbitrary', Arbitrary);
        expect(resolveQuery('arbitrary')).toBe(Arbitrary);
        expect(() => requireArcProxy(Arbitrary, QueryFor<object, object>, 'query')).toThrow('Invalid query binding');
    });

    it('should reject a native subclass requiring constructor arguments without invoking it', () => {
        class NeedsArguments extends Snapshot { constructor(readonly input: string) { super(); } }
        expect(() => requireArcProxy(NeedsArguments, QueryFor<object, object>, 'query')).toThrow('zero-argument Arc');
    });
});
