// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface ComponentBindingOutputs {
    setOutput(property: string, value: unknown): void;
    clearOutput(property: string): void;
    clearAll(): void;
}

export interface BindingOutputProviderValue {
    outputs: Record<string, Record<string, unknown>>;
    outputFor(elementId: string): ComponentBindingOutputs;
}

const emptyOutputs: ComponentBindingOutputs = {
    setOutput: () => undefined,
    clearOutput: () => undefined,
    clearAll: () => undefined,
};

const Context = createContext<BindingOutputProviderValue | undefined>(undefined);

export interface BindingOutputProviderProps {
    children: ReactNode;
    onOutputsChanged?: (outputs: Record<string, Record<string, unknown>>) => void;
}

/**
 * Tracks component output properties for typed component-property bindings and clears them with component lifecycle.
 */
export function BindingOutputProvider({ children, onOutputsChanged }: BindingOutputProviderProps) {
    const [outputs, setOutputs] = useState<Record<string, Record<string, unknown>>>({});

    useEffect(() => {
        onOutputsChanged?.(outputs);
    }, [onOutputsChanged, outputs]);

    const outputFor = useCallback((elementId: string): ComponentBindingOutputs => ({
        setOutput: (property: string, propertyValue: unknown) => setOutputs(current => ({
            ...current,
            [elementId]: { ...(current[elementId] ?? {}), [property]: propertyValue },
        })),
        clearOutput: (property: string) => setOutputs(current => {
            const elementOutputs = { ...(current[elementId] ?? {}) };
            delete elementOutputs[property];
            return { ...current, [elementId]: elementOutputs };
        }),
        clearAll: () => setOutputs(current => {
            const next = { ...current };
            delete next[elementId];
            return next;
        }),
    }), []);

    const value = useMemo<BindingOutputProviderValue>(() => ({ outputs, outputFor }), [outputs, outputFor]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useBindingOutputs(elementId: string): ComponentBindingOutputs {
    const outputFor = useContext(Context)?.outputFor;
    return useMemo(() => outputFor?.(elementId) ?? emptyOutputs, [outputFor, elementId]);
}

export function useBindingOutputScope(): Record<string, Record<string, unknown>> {
    return useContext(Context)?.outputs ?? {};
}
