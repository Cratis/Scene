// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { BindingResolver, BindingScope, nestBindingScope, resolveBindingExpression } from '@cratis/scene.engine';
import { BindingExpression, BindingNullBehavior } from '@cratis/scene.model';
import { BindingOutputProvider, useBindingOutputScope } from './BindingOutputContext';

interface RenderBindingScopeValue {
    resolveBinding: BindingResolver;
    scope: BindingScope;
}

const Context = createContext<RenderBindingScopeValue | undefined>(undefined);

export interface RenderBindingScopeProviderProps {
    children: ReactNode;
    dataContext?: unknown;
    queryResults?: Record<string, unknown>;
    componentOutputs?: Record<string, Record<string, unknown>>;
    resolveBinding?: BindingResolver;
    onComponentOutputsChanged?: (outputs: Record<string, Record<string, unknown>>) => void;
}

/**
 * Provides the inherited reactive binding scope for a rendered Scene tree.
 *
 * The outermost provider owns the component output scope. A provider rendered inside another - a nested
 * template or region - nests its own data context, query results and component outputs over the inherited
 * scope with `nestBindingScope`, so a detail region bound to the selected row reads that row while still
 * seeing the screen's queries and every component's outputs.
 */
export function RenderBindingScopeProvider(props: RenderBindingScopeProviderProps) {
    const current = useContext(Context);
    if (current) return <RenderBindingScopeInner {...props} parent={current.scope} />;

    return (
        <BindingOutputProvider onOutputsChanged={props.onComponentOutputsChanged}>
            <RenderBindingScopeInner {...props} />
        </BindingOutputProvider>
    );
}

function RenderBindingScopeInner({ children, dataContext, queryResults, componentOutputs, resolveBinding, parent }: RenderBindingScopeProviderProps & { parent?: BindingScope }) {
    const outputs = useBindingOutputScope();
    const previousValues = useRef(new Map<string, unknown>());
    const scope = useMemo<BindingScope>(() => {
        const own = { dataContext, queryResults, componentOutputs: { ...(componentOutputs ?? {}), ...outputs } };
        return parent ? nestBindingScope(parent, own) : own;
    }, [componentOutputs, dataContext, outputs, parent, queryResults]);

    const resolver = useCallback<BindingResolver>((binding: BindingExpression) => {
        if (!binding.kind && resolveBinding) return resolveBinding(binding);

        const key = JSON.stringify(binding);
        const value = resolveBindingExpression(binding, scope);
        if (binding.nullBehavior === BindingNullBehavior.Preserve && value === undefined) {
            return previousValues.current.get(key);
        }

        if (value !== undefined) previousValues.current.set(key, value);
        return value;
    }, [resolveBinding, scope]);

    const value = useMemo<RenderBindingScopeValue>(() => ({ resolveBinding: resolver, scope }), [resolver, scope]);
    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useRenderBindingResolver(): BindingResolver {
    const context = useContext(Context);
    if (!context) throw new Error('No Scene render binding scope is available.');
    return context.resolveBinding;
}

export function useRenderBindingScope(): BindingScope {
    return useContext(Context)?.scope ?? {};
}
