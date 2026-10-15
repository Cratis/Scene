// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The pseudo-random generator behind generated sample data. The C# engine implements the identical
 * algorithm, and both are asserted against golden rows in `sample-data-resolution-fixtures.json`.
 *
 * Algorithm (all arithmetic on unsigned 32-bit integers, wrapping):
 *
 * - `hash32(x)`: `x = (x ^ (x >>> 16)) * 0x85EBCA6B; x = (x ^ (x >>> 13)) * 0xC2B2AE35; return x ^ (x >>> 16)`.
 * - `splitmix32(state)`: `state += 0x9E3779B9`, then `hash32(state)`.
 * - `fnv1a32(text)`: FNV-1a over the UTF-8 bytes of the text (offset basis `0x811C9DC5`, prime `0x01000193`).
 * - The generator is xoshiro128** seeded with four consecutive `splitmix32` outputs of the seed.
 * - `nextInt(bound)` is `next() % bound`.
 * - Row `i` of a shape named `S` generated with seed `n` uses its own generator seeded with
 *   `hash32((n ^ fnv1a32(S)) + (i + 1) * 0x9E3779B9)`, so a row never depends on how many rows are asked for.
 */
export function hash32(value: number): number {
    let x = value >>> 0;
    x = Math.imul(x ^ (x >>> 16), 0x85EBCA6B) >>> 0;
    x = Math.imul(x ^ (x >>> 13), 0xC2B2AE35) >>> 0;
    return (x ^ (x >>> 16)) >>> 0;
}

/** FNV-1a (32-bit) over the UTF-8 bytes of a string. */
export function fnv1a32(text: string): number {
    let hash = 0x811C9DC5;
    for (const byte of new TextEncoder().encode(text)) {
        hash = Math.imul(hash ^ byte, 0x01000193) >>> 0;
    }
    return hash;
}

/** The seed of the generator for one row of one shape. */
export function rowSeed(seed: number, shapeName: string, rowIndex: number): number {
    return hash32((((seed ^ fnv1a32(shapeName)) >>> 0) + Math.imul(rowIndex + 1, 0x9E3779B9)) >>> 0);
}

/** xoshiro128** with splitmix32 seeding. */
export class SampleRandom {
    private s0: number;
    private s1: number;
    private s2: number;
    private s3: number;

    constructor(seed: number) {
        let state = seed >>> 0;
        const step = () => {
            state = (state + 0x9E3779B9) >>> 0;
            return hash32(state);
        };
        this.s0 = step();
        this.s1 = step();
        this.s2 = step();
        this.s3 = step();
        if ((this.s0 | this.s1 | this.s2 | this.s3) === 0) this.s0 = 1;
    }

    /** The next unsigned 32-bit value. */
    next(): number {
        const result = Math.imul(rotateLeft(Math.imul(this.s1, 5) >>> 0, 7), 9) >>> 0;
        const t = (this.s1 << 9) >>> 0;
        this.s2 = (this.s2 ^ this.s0) >>> 0;
        this.s3 = (this.s3 ^ this.s1) >>> 0;
        this.s1 = (this.s1 ^ this.s2) >>> 0;
        this.s0 = (this.s0 ^ this.s3) >>> 0;
        this.s2 = (this.s2 ^ t) >>> 0;
        this.s3 = rotateLeft(this.s3, 11);
        return result;
    }

    /** A value in `[0, bound)`; zero when the bound is zero. */
    nextInt(bound: number): number {
        return bound <= 0 ? 0 : this.next() % bound;
    }

    /** One element of a non-empty list. */
    pick<T>(items: readonly T[]): T {
        return items[this.nextInt(items.length)];
    }
}

function rotateLeft(value: number, bits: number): number {
    return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}
