// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { BoundConstructor } from './BoundConstructor';

/**
 * Bridge for the generated, zero-argument Arc proxies consumed by Components. The registry remains
 * open to arbitrary constructors; only mounting an Arc adapter requires this narrower contract.
 * Check inheritance without constructing a proxy (constructors can have side effects).
 *
 * This is not structural interface validation: the host still owns the generated subclass's data,
 * argument and implementation correctness. Prototype identity deliberately rejects duck-typed proxies
 * and proxies from a second Arc installation. The arity check enforces the generated convention,
 * not general JavaScript constructor safety (defaults/rest parameters can hide requirements).
 * The single assertion bridges the registry under that host-owned generated-proxy contract; it is
 * not a proof of arbitrary subclass behavior or of erased row/argument types.
 */
export function requireArcProxy<T extends object>(target: BoundConstructor, base: { prototype: T }, kind: string): new () => T {
    const prototype: unknown = target.prototype;
    if (target.length !== 0 || typeof prototype !== 'object' || prototype === null || !Object.prototype.isPrototypeOf.call(base.prototype, prototype)) {
        throw new Error(`Invalid ${kind} binding '${target.name}': expected a zero-argument Arc ${kind} proxy`);
    }
    return target as new () => T;
}
