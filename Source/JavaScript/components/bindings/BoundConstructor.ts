// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * A class a host registers under a name - an Arc query or command proxy, as generated from the backend's
 * `[ReadModel]` and `[Command]` types.
 *
 * `@cratis/components` types these as `Constructor<T>` from `@cratis/fundamentals`, constrained to
 * `IQueryFor<T>` / a command shape. This registry intentionally does not use those types: optional
 * Arc peers must not make an Arc-free preview load Arc. The lazy Components bridge validates native
 * proxy inheritance and the zero-argument constructor convention before passing a binding on.
 *
 * So the registry stores the widest honest shape: something that can be constructed. Whether a
 * registered class really is a query or a command is the host's responsibility, and it is checkable
 * where the host registers it, with the real Arc types in scope. Arbitrary registrations remain usable
 * by other consumers; the lazy Arc bridge rejects unsupported constructors visibly.
 *
 * `never[]` rather than `unknown[]` for the parameters so that any constructor is assignable, regardless
 * of what it takes; `unknown[]` would only accept constructors whose parameters accept anything.
 */
export type BoundConstructor = new (...args: never[]) => object;
