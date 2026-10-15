// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Text;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// The pseudo-random generator behind generated sample data: xoshiro128** seeded with four consecutive splitmix32 outputs. The
/// TypeScript engine (<c language="csharp">SampleRandom.ts</c>) implements the identical algorithm, and both are asserted against
/// golden rows in <c language="csharp">sample-data-resolution-fixtures.json</c>. All arithmetic is on wrapping unsigned 32-bit integers.
/// </summary>
public class SampleRandom
{
    const uint GoldenRatio = 0x9E3779B9;
    uint _s0;
    uint _s1;
    uint _s2;
    uint _s3;

    /// <summary>
    /// Initializes a new instance of the <see cref="SampleRandom"/> class.
    /// </summary>
    /// <param name="seed">The seed.</param>
    public SampleRandom(uint seed)
    {
        var state = seed;
        uint Step()
        {
            state = unchecked(state + GoldenRatio);
            return Hash32(state);
        }

        _s0 = Step();
        _s1 = Step();
        _s2 = Step();
        _s3 = Step();
        if ((_s0 | _s1 | _s2 | _s3) == 0)
        {
            _s0 = 1;
        }
    }

    /// <summary>
    /// The 32-bit finalizer hash: <c language="csharp">x = (x ^ (x >> 16)) * 0x85EBCA6B; x = (x ^ (x >> 13)) * 0xC2B2AE35; x ^ (x >> 16)</c>.
    /// </summary>
    /// <param name="value">The value to hash.</param>
    /// <returns>The hash.</returns>
    public static uint Hash32(uint value)
    {
        unchecked
        {
            var x = value;
            x = (x ^ (x >> 16)) * 0x85EBCA6B;
            x = (x ^ (x >> 13)) * 0xC2B2AE35;
            return x ^ (x >> 16);
        }
    }

    /// <summary>
    /// FNV-1a (32-bit) over the UTF-8 bytes of a string.
    /// </summary>
    /// <param name="text">The text.</param>
    /// <returns>The hash.</returns>
    public static uint Fnv1a32(string text)
    {
        unchecked
        {
            var hash = 0x811C9DC5;
            foreach (var value in Encoding.UTF8.GetBytes(text))
            {
                hash = (hash ^ value) * 0x01000193;
            }

            return hash;
        }
    }

    /// <summary>
    /// The seed of the generator for one row of one shape: <c language="csharp">hash32((seed ^ fnv1a32(shape)) + (index + 1) * 0x9E3779B9)</c>.
    /// </summary>
    /// <param name="seed">The seed of the generation.</param>
    /// <param name="shapeName">The name of the shape.</param>
    /// <param name="rowIndex">The zero based row index.</param>
    /// <returns>The row's seed.</returns>
    public static uint RowSeed(uint seed, string shapeName, int rowIndex) =>
        unchecked(Hash32((seed ^ Fnv1a32(shapeName)) + ((uint)(rowIndex + 1) * GoldenRatio)));

    /// <summary>
    /// The next unsigned 32-bit value.
    /// </summary>
    /// <returns>The value.</returns>
    public uint Next()
    {
        unchecked
        {
            var result = RotateLeft(_s1 * 5, 7) * 9;
            var t = _s1 << 9;
            _s2 ^= _s0;
            _s3 ^= _s1;
            _s1 ^= _s2;
            _s0 ^= _s3;
            _s2 ^= t;
            _s3 = RotateLeft(_s3, 11);
            return result;
        }
    }

    /// <summary>
    /// A value in <c language="csharp">[0, bound)</c>; zero when the bound is not positive.
    /// </summary>
    /// <param name="bound">The exclusive upper bound.</param>
    /// <returns>The value.</returns>
    public long NextInt(long bound) => bound <= 0 ? 0 : Next() % bound;

    /// <summary>
    /// One element of a non-empty list.
    /// </summary>
    /// <typeparam name="T">The element type.</typeparam>
    /// <param name="items">The items.</param>
    /// <returns>An item.</returns>
    public T Pick<T>(IReadOnlyList<T> items) => items[(int)NextInt(items.Count)];

    static uint RotateLeft(uint value, int bits) => (value << bits) | (value >> (32 - bits));
}
