// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The severities PrimeReact 11 accepts, as it spells them.
 *
 * This is a union rather than an enum, which is the one place in this package that convention is worth
 * departing from. The value is handed straight to PrimeReact props whose own types are string-literal
 * unions, and a TypeScript string enum member is *not* assignable to a string literal - so an enum here
 * would buy discoverability at the cost of a cast at every call site, which is the opposite of the point.
 * The rule exists for vocabularies Scene owns; this one is PrimeReact's contract, and mirroring it exactly
 * is what keeps the adapters cast-free.
 *
 * Not every component accepts every member - `Message` takes a narrower set than `Button` does - so a
 * component still narrows further where its own prop type demands it.
 */
export type PrimeSeverity = 'secondary' | 'info' | 'success' | 'warn' | 'danger' | 'help' | 'contrast';
