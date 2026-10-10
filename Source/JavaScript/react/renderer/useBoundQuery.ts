// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useRef, useState } from 'react';
import { QueryBindingState } from '@cratis/scene.engine';
import { QueryPerformer } from './AbortableQueryRunner';

/**
 * Runs a bound query whenever its arguments change and returns the accepted query results.
 *
 * Each change of arguments rebinds the query: the previous run is aborted and, should its answer still
 * arrive, discarded by `QueryBindingState` - a slow result for a previous selection never replaces the
 * current one. Arguments of `undefined` mean the binding is cleared, as when a selection is cleared, so the
 * result is removed, and so is it when the current run fails - a failed rebind must not leave the previous
 * selection's data on screen. The results are keyed by `query`, ready to pass as a scope's `queryResults`.
 */
export function useBoundQuery(query: string, argumentsValue: unknown, perform: QueryPerformer): Record<string, unknown> {
    const state = useMemo(() => new QueryBindingState(), []);
    const [results, setResults] = useState<Record<string, unknown>>({});
    const key = argumentsValue === undefined ? undefined : JSON.stringify(argumentsValue);
    const latestArguments = useRef(argumentsValue);
    latestArguments.current = argumentsValue;

    // The arguments are compared by value through `key`; the effect reads them from `latestArguments`.
    useEffect(() => {
        const argumentsForRun = latestArguments.current;
        if (argumentsForRun === undefined) {
            state.clear(query);
            setResults(state.queryResults);
            return undefined;
        }

        const controller = new AbortController();
        const ticket = state.begin(query);
        perform(query, argumentsForRun, controller.signal).then(
            result => {
                if (state.complete(ticket, result)) setResults(state.queryResults);
            },
            () => {
                if (controller.signal.aborted || !state.complete(ticket, undefined)) return;
                state.clear(query);
                setResults(state.queryResults);
            },
        );

        return () => controller.abort();
    }, [key, perform, query, state]);

    return results;
}
