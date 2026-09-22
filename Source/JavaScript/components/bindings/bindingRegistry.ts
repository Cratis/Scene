// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BoundConstructor } from './BoundConstructor';

const queries = new Map<string, BoundConstructor>();
const commands = new Map<string, BoundConstructor>();
// Opt-in identities are separate from the legacy last-registration-wins namespace.
const queryIdentities = new Map<string, Map<string, BoundConstructor>>();
const queryBindingListeners = new Set<() => void>();

function notifyQueryBindings(): void {
    for (const listener of queryBindingListeners) listener();
}

/** Subscribe to exact-binding changes. Existing adapters retain their render-time lookup contract. */
export function subscribeQueryBindings(listener: () => void): () => void {
    queryBindingListeners.add(listener);
    return () => { queryBindingListeners.delete(listener); };
}

/**
 * Registers one source identity for an exact query name. The same identity replaces on hot reload;
 * different identities remain distinct candidates, even when their constructors happen to match.
 * Legacy resolution also accepts a unique identity when no legacy registration exists.
 */
export function registerQueryIdentity(name: string, identity: string, queryClass: BoundConstructor): void {
    const candidates = queryIdentities.get(name) ?? new Map<string, BoundConstructor>();
    candidates.set(identity, queryClass);
    queryIdentities.set(name, candidates);
    notifyQueryBindings();
}

/** Removes a source identity when a generated module is removed or renamed. */
export function unregisterQueryIdentity(name: string, identity: string): void {
    const candidates = queryIdentities.get(name);
    candidates?.delete(identity);
    if (candidates?.size === 0) queryIdentities.delete(name);
    notifyQueryBindings();
}

/** Exact binding: a legacy registration counts as one candidate alongside opt-in identities. */
export function resolveExactQuery(name: string): BoundConstructor | 'ambiguous' | undefined {
    const legacy = queries.get(name);
    const candidates = queryIdentities.get(name);
    if ((legacy ? 1 : 0) + (candidates?.size ?? 0) > 1) return 'ambiguous';
    return legacy ?? candidates?.values().next().value;
}

/**
 * Registers an Arc query proxy under the name screens refer to it by.
 *
 * This is the seam that makes the Arc-bound half of `@cratis/components` usable from Scene at all. A
 * screen says `data Invoices via query AllInvoices`, and by the time that reaches a renderer it is an
 * `ExternalComponent` whose `properties` bag holds the *string* `'AllInvoices'` - a property bag carries
 * plain values and named slots, and there is no way to put a TypeScript class into one. `DataTableForQuery`
 * needs the class. The name is the only thing that survives the trip, so the name is what the lookup has
 * to be keyed on, and a host that owns the generated proxies is the only party that can supply the class
 * behind it.
 *
 * A host - Stage's generated application, or Studio's preview when it is wired to a real backend -
 * registers every proxy a screen can name, once, during startup. Registering the same name twice
 * replaces the earlier registration, so a host can re-register on hot reload without having to unwind
 * the previous run.
 */
export function registerQuery(name: string, queryClass: BoundConstructor): void {
    queries.set(name, queryClass);
    notifyQueryBindings();
}

/**
 * Registers several query proxies at once, keyed by the name screens refer to each by.
 *
 * Stage generates a module that exports every proxy it produced; handing that module's exports straight
 * to this is the whole of a generated host's registration step, and it stays correct as proxies are
 * added and removed without anyone editing a list.
 */
export function registerQueries(bindings: Record<string, BoundConstructor>): void {
    for (const [name, queryClass] of Object.entries(bindings)) {
        registerQuery(name, queryClass);
    }
}

/**
 * Legacy registrations are authoritative. Otherwise resolve a unique source identity, or `undefined`
 * when absent or ambiguous (existing adapters display their unresolved-binding placeholder).
 *
 * `undefined` rather than a throw: design-time preview in Studio normally has nothing registered at all,
 * and a screen still has to render so its layout can be worked on. Every adapter turns `undefined` into
 * a visible placeholder naming the binding it wanted.
 */
export function resolveQuery(name: string): BoundConstructor | undefined {
    const legacy = queries.get(name);
    if (legacy) return legacy;
    const candidates = queryIdentities.get(name);
    return candidates?.size === 1 ? candidates.values().next().value : undefined;
}

/**
 * Registers an Arc command proxy under the name screens refer to it by. The command half of
 * {@link registerQuery}, with the same contract.
 */
export function registerCommand(name: string, commandClass: BoundConstructor): void {
    commands.set(name, commandClass);
}

/**
 * Registers several command proxies at once, keyed by the name screens refer to each by.
 */
export function registerCommands(bindings: Record<string, BoundConstructor>): void {
    for (const [name, commandClass] of Object.entries(bindings)) {
        registerCommand(name, commandClass);
    }
}

/**
 * The command proxy registered under a name, or `undefined` when nothing is registered under it.
 */
export function resolveCommand(name: string): BoundConstructor | undefined {
    return commands.get(name);
}

/**
 * The sorted union of legacy and identity query names, including ambiguous names.
 *
 * A design-time tool uses this to offer the names a screen can actually bind to, and a diagnostics
 * surface uses it to explain a placeholder - "this screen wants `AllInvoices`, and here is what is
 * registered" is a far more useful message than the placeholder alone.
 */
export function registeredQueryNames(): string[] {
    return [...new Set([...queries.keys(), ...queryIdentities.keys()])].sort();
}

/**
 * Every registered command name, sorted.
 */
export function registeredCommandNames(): string[] {
    return [...commands.keys()].sort();
}

/**
 * Forgets every registered query and command.
 *
 * The registry is module-level state, which is right for a host that registers once at startup but wrong
 * for anything that switches between applications - Studio previewing a different project, or a spec
 * that must not inherit what the previous one registered. Both need a way back to empty.
 */
export function clearBindings(): void {
    queries.clear();
    commands.clear();
    queryIdentities.clear();
    notifyQueryBindings();
}
