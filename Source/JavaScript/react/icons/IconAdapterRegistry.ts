// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconAdapter } from './IconAdapter';

/**
 * The icon adapters a renderer has, one per library. Registering is explicit and never replaces: two
 * adapters for one library would mean an icon renders differently depending on registration order, which
 * is the silent swapping the library-qualified reference exists to prevent.
 */
export class IconAdapterRegistry {
    readonly #adapters = new Map<string, IconAdapter>();

    /**
     * Adds an adapter.
     *
     * @throws Error when an adapter for the same library is already registered.
     */
    register(adapter: IconAdapter): this {
        if (this.#adapters.has(adapter.library)) {
            throw new Error(`An icon adapter for the library '${adapter.library}' is already registered`);
        }

        this.#adapters.set(adapter.library, adapter);
        return this;
    }

    /**
     * The adapter for a library, or `undefined` when this renderer has none.
     */
    get(library: string): IconAdapter | undefined {
        return this.#adapters.get(library);
    }

    /**
     * The libraries this registry can render.
     */
    get libraries(): string[] {
        return [...this.#adapters.keys()];
    }
}

/**
 * Creates a registry holding the given adapters.
 */
export function createIconAdapterRegistry(adapters: IconAdapter[] = []): IconAdapterRegistry {
    const registry = new IconAdapterRegistry();
    adapters.forEach((adapter) => registry.register(adapter));
    return registry;
}
