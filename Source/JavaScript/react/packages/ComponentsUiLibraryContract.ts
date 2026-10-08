// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The web-only mapping between an independently authored Scene catalog and a Components renderer.
 * Primitive slot identities are not Scene component names: composites such as DataTable remain
 * library-independent. This contract belongs to the React bundle, never the platform-neutral model.
 */
export interface ComponentsUiLibraryContract {
    /** The npm module the host loads through its explicit package allowlist. */
    module: string;
    /** The named export supplying the Components UiLibrary. */
    exportName: string;
    /** The expected runtime library identity. */
    id: string;
    /** The Components renderer ABI major required by this mapping. */
    abi: number;
    /** The renderer profile promised by the library. */
    profile: string;
    /** Primitive or presentation slots the Scene integration requires. */
    requiredSlots: readonly string[];
    /** Capabilities required by the integration, not inferred from library identity. */
    requiredCapabilities?: readonly string[];
}

/**
 * The structural part of Components' UiLibrary needed to check a mapping. The actual library may
 * also contain providers and executable slot declarations; Scene does not load or reinterpret them.
 * Keeping this structural avoids a Components ABI dependency in Scene.Model or Scene.Engine.
 */
export interface ComponentsUiLibraryManifest {
    readonly id: string;
    readonly abi: number;
    readonly profile: string;
    readonly slots: object;
    readonly capabilities: readonly string[];
}

/** Checks a mapping before loading executable frontend code. */
export function validateComponentsUiLibraryContract(contract: ComponentsUiLibraryContract): string[] {
    const problems: string[] = [];
    for (const field of ['module', 'exportName', 'id', 'profile'] as const) {
        if (contract[field].trim().length === 0) problems.push(`Components UI library mapping has an empty '${field}'`);
    }
    if (!Number.isInteger(contract.abi) || contract.abi < 1) {
        problems.push('Components UI library mapping requires a positive integer ABI major');
    }
    for (const [field, values] of [
        ['requiredSlots', contract.requiredSlots],
        ['requiredCapabilities', contract.requiredCapabilities ?? []],
    ] as const) {
        const seen = new Set<string>();
        for (const value of values) {
            if (value.trim().length === 0) problems.push(`Components UI library mapping has an empty '${field}' entry`);
            if (seen.has(value)) problems.push(`Components UI library mapping repeats '${value}' in '${field}'`);
            seen.add(value);
        }
    }
    return problems;
}

/**
 * Proves that an allowlisted module export satisfies its Scene mapping. Hosts must reject problems,
 * rather than silently falling back to a different library. Additional slots are permitted: a
 * renderer can support more than the bounded profile this integration consumes.
 */
export function validateComponentsUiLibraryMapping(
    contract: ComponentsUiLibraryContract,
    library: ComponentsUiLibraryManifest,
): string[] {
    const problems = validateComponentsUiLibraryContract(contract);
    for (const field of ['id', 'abi', 'profile'] as const) {
        if (library[field] !== contract[field]) {
            problems.push(`Components UI library '${contract.id}' requires ${field} '${contract[field]}' but the loaded library supplies '${library[field]}'`);
        }
    }
    const slots = new Map(Object.entries(library.slots));
    for (const slot of contract.requiredSlots) {
        if (!slots.has(slot) || slots.get(slot) === undefined || slots.get(slot) === null) {
            problems.push(`Components UI library '${contract.id}' provides no implementation for required slot '${slot}'`);
        }
    }
    for (const capability of contract.requiredCapabilities ?? []) {
        if (!library.capabilities.includes(capability)) {
            problems.push(`Components UI library '${contract.id}' does not support required capability '${capability}'`);
        }
    }
    return problems;
}
