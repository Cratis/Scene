// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

using System.Globalization;
using System.Text.Json.Nodes;
using Cratis.Scene.Model.SampleData;

namespace Cratis.Scene.Engine.SampleData;

/// <summary>
/// Generates deterministic sample rows for a shape, typed by field kind. The same shape, seed, row count and locale yield the same
/// rows - byte-identical once serialized - in this and the TypeScript engine (<c language="csharp">generateSample</c>), asserted by the
/// shared corpus.
/// </summary>
/// <remarks>
/// Each row has its own generator (<see cref="SampleRandom.RowSeed"/>), so row <c language="csharp">i</c> is the same however many rows are asked
/// for. Within a row the fields are generated in declaration order. A nullable field first draws whether it is null (one in
/// five is) and then always draws its value, so the sequence never depends on nullability outcomes. Values follow the field's
/// kind and locale; enum fields only ever produce one of their values, dates stay within 2024-2025 and amounts have two decimals.
/// </remarks>
public static class SampleDataGenerator
{
    /// <summary>The seed used when none is given, so previews are stable without any configuration.</summary>
    public const uint DefaultSeed = 1;

    /// <summary>How many rows are generated when no count is given.</summary>
    public const int DefaultRowCount = 5;

    /// <summary>The most rows one call generates.</summary>
    public const int MaximumRowCount = 1000;

    const int AnchorDay = 19723;
    const int DateSpanDays = 731;

    static readonly DateOnly _epoch = new(1970, 1, 1);

    static readonly Dictionary<char, string> _transliterations = new()
    {
        ['æ'] = "ae",
        ['ø'] = "o",
        ['å'] = "a",
        ['ä'] = "a",
        ['ö'] = "o",
        ['ü'] = "u",
        ['ß'] = "ss",
        ['é'] = "e"
    };

    /// <summary>
    /// Generates rows of a shape.
    /// </summary>
    /// <param name="shape">The shape to generate rows for.</param>
    /// <param name="seed">The seed; defaults to <see cref="DefaultSeed"/>. Reduced modulo 2^32.</param>
    /// <param name="rowCount">The number of rows; defaults to <see cref="DefaultRowCount"/>, clamped to <c language="csharp">[0, 1000]</c>.</param>
    /// <param name="locale">The BCP 47 locale tag selecting names, cities and formats; unknown tags use the default pool.</param>
    /// <returns>The rows.</returns>
    public static IReadOnlyList<JsonObject> Generate(SampleShape shape, long? seed = null, int? rowCount = null, string? locale = null)
    {
        var count = Math.Min(Math.Max(rowCount ?? DefaultRowCount, 0), MaximumRowCount);
        var effectiveSeed = seed is null ? DefaultSeed : unchecked((uint)seed.Value);
        var pool = SampleLocales.For(locale);
        var rows = new List<JsonObject>(count);

        for (var index = 0; index < count; index++)
        {
            var random = new SampleRandom(SampleRandom.RowSeed(effectiveSeed, shape.Name, index));
            var row = new JsonObject();
            foreach (var field in shape.Fields)
            {
                var isNull = field.Nullable == true && random.NextInt(5) == 0;
                var value = GenerateValue(field, SampleFieldKindInference.Infer(field), random, pool);
                row[field.Name] = isNull ? null : value;
            }

            rows.Add(row);
        }

        return rows;
    }

    static JsonNode? GenerateValue(SampleShapeField field, SampleFieldKind kind, SampleRandom random, SampleLocale pool)
    {
        switch (kind)
        {
            case SampleFieldKind.Id:
                return GenerateId(random);
            case SampleFieldKind.Name:
                {
                    var first = random.Pick(pool.FirstNames);
                    return $"{first} {random.Pick(pool.LastNames)}";
                }

            case SampleFieldKind.Company:
                return random.Pick(pool.Companies);
            case SampleFieldKind.Email:
                {
                    var first = random.Pick(pool.FirstNames);
                    var last = random.Pick(pool.LastNames);
                    return $"{Slug(first)}.{Slug(last)}@{random.Pick(pool.Domains)}";
                }

            case SampleFieldKind.Phone:
                return string.Concat(pool.PhoneTemplate.Select(character => character == '#' ? (char)('0' + random.NextInt(10)) : character));
            case SampleFieldKind.City:
                return random.Pick(pool.Cities);
            case SampleFieldKind.Text:
                return Capitalize(string.Join(' ', Enumerable.Range(0, (int)(3 + random.NextInt(4))).Select(_ => random.Pick(pool.Words))));
            case SampleFieldKind.WholeNumber:
                {
                    var (low, high) = Range(field.Min, field.Max, 0, 1000, Math.Truncate);
                    return (long)low + random.NextInt((long)high - (long)low + 1);
                }

            case SampleFieldKind.Amount:
                {
                    var (low, high) = Range(field.Min, field.Max, 10, 5000, value => Math.Floor((value * 100) + 0.5));
                    return ((long)low + random.NextInt((long)high - (long)low + 1)) / 100.0;
                }

            case SampleFieldKind.Boolean:
                return random.NextInt(2) == 1;
            case SampleFieldKind.Date:
                return FormatDay(AnchorDay + (int)random.NextInt(DateSpanDays));
            case SampleFieldKind.DateTime:
                return GenerateDateTime(random);
            case SampleFieldKind.Enum:
                return field.EnumValues is { Count: > 0 } ? random.Pick(field.EnumValues) : null;
            default:
                return null;
        }
    }

    static (double Low, double High) Range(double? min, double? max, double defaultMin, double defaultMax, Func<double, double> convert)
    {
        var low = convert(min ?? defaultMin);
        var high = convert(max ?? defaultMax);
        return high < low ? (high, low) : (low, high);
    }

    static string GenerateDateTime(SampleRandom random)
    {
        var day = AnchorDay + (int)random.NextInt(DateSpanDays);
        var seconds = (int)random.NextInt(86400);
        var secondOfHour = seconds % 3600;
        return $"{FormatDay(day)}T{Pad(seconds / 3600)}:{Pad(secondOfHour / 60)}:{Pad(secondOfHour % 60)}Z";
    }

    static string GenerateId(SampleRandom random)
    {
        var a = random.Next();
        var b = (random.Next() & 0xFFFF0FFF) | 0x00004000;
        var c = (random.Next() & 0x3FFFFFFF) | 0x80000000;
        var d = random.Next();
        return $"{Hex(a, 8)}-{Hex(b >> 16, 4)}-{Hex(b & 0xFFFF, 4)}-{Hex(c >> 16, 4)}-{Hex(c & 0xFFFF, 4)}{Hex(d, 8)}";
    }

    static string Slug(string text) =>
        string.Concat(text
            .ToLowerInvariant()
            .SelectMany(character => _transliterations.TryGetValue(character, out var replacement) ? replacement : character.ToString())
            .Where(part => (part is >= 'a' and <= 'z') || (part is >= '0' and <= '9')));

    static string Capitalize(string text) =>
        text.Length > 0 && text[0] is >= 'a' and <= 'z' ? char.ToUpperInvariant(text[0]) + text[1..] : text;

    static string Hex(uint value, int digits) => value.ToString("x", CultureInfo.InvariantCulture).PadLeft(digits, '0');

    static string Pad(int value) => value < 10 ? $"0{value}" : value.ToString(CultureInfo.InvariantCulture);

    static string FormatDay(int days) => _epoch.AddDays(days).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}
