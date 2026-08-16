// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { BoundConstructor } from './BoundConstructor';

const queries = new Map<string, BoundConstructor>();
const commands = new Map<string, BoundConstructor>();

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
 * The query proxy registered under a name, or `undefined` when nothing is registered under it.
 *
 * `undefined` rather than a throw: design-time preview in Studio normally has nothing registered at all,
 * and a screen still has to render so its layout can be worked on. Every adapter turns `undefined` into
 * a visible placeholder naming the binding it wanted.
 */
export function resolveQuery(name: string): BoundConstructor | undefined {
    return queries.get(name);
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
 * Every registered query name, sorted.
 *
 * A design-time tool uses this to offer the names a screen can actually bind to, and a diagnostics
 * surface uses it to explain a placeholder - "this screen wants `AllInvoices`, and here is what is
 * registered" is a far more useful message than the placeholder alone.
 */
export function registeredQueryNames(): string[] {
    return [...queries.keys()].sort();
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
}
