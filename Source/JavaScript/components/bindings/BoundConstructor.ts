// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A class a host registers under a name - an Arc query or command proxy, as generated from the backend's
 * `[ReadModel]` and `[Command]` types.
 *
 * `@cratis/components` types these as `Constructor<T>` from `@cratis/fundamentals`, constrained to
 * `IQueryFor<T>` / a command shape. This package cannot use those types: `@cratis/arc` and
 * `@cratis/fundamentals` are peer dependencies of `@cratis/components` that the *host* provides, and
 * Scene deliberately does not depend on Arc - a Scene screen is a UI model, and the whole point of the
 * registry is that Scene never needs to know what an Arc proxy is.
 *
 * So the registry stores the widest honest shape: something that can be constructed. Whether a
 * registered class really is a query or a command is the host's responsibility, and it is checkable
 * where the host registers it, with the real Arc types in scope - which is exactly where it should be.
 *
 * `never[]` rather than `unknown[]` for the parameters so that any constructor is assignable, regardless
 * of what it takes; `unknown[]` would only accept constructors whose parameters accept anything.
 */
export type BoundConstructor = new (...args: never[]) => object;
