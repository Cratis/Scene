// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleFieldKind, SampleShape, SampleShapeField } from '@cratis/scene.model';
import { inferSampleFieldKind } from './inferSampleFieldKind';
import { SampleLocale, sampleLocaleFor } from './sampleLocales';
import { SampleRandom, rowSeed } from './SampleRandom';

/** The seed used when none is given, so previews are stable without any configuration. */
export const defaultSampleSeed = 1;

/** How many rows are generated when no count is given. */
export const defaultSampleRowCount = 5;

/** The most rows one call generates. */
export const maximumSampleRowCount = 1000;

/** Days since 1970-01-01 of 2024-01-01, the anchor generated dates count forward from. */
const anchorDay = 19723;

/** Generated dates fall within this many days after the anchor. */
const dateSpanDays = 731;

/**
 * Generates `rowCount` rows of a shape, deterministically for a seed: the same shape, seed, row count and
 * locale yield the same rows (byte-identical once serialized) in the C# and TypeScript engines.
 *
 * Each row has its own generator (see {@link rowSeed}), so row `i` is the same however many rows are asked
 * for. Within a row the fields are generated in declaration order. A nullable field first draws whether it is
 * null (one in five is) and then always draws its value, so the sequence never depends on nullability
 * outcomes. Values follow the field's kind and locale; enum fields only ever produce one of their values,
 * dates stay within 2024-2025 and amounts have two decimals.
 *
 * @param shape The shape to generate rows for.
 * @param seed The seed; defaults to {@link defaultSampleSeed}.
 * @param rowCount The number of rows; defaults to {@link defaultSampleRowCount}, clamped to `[0, 1000]`.
 * @param locale The BCP 47 locale tag selecting names, cities and formats; unknown tags use the default pool.
 */
export function generateSample(shape: SampleShape, seed?: number, rowCount?: number, locale?: string): Record<string, unknown>[] {
    const count = Math.min(Math.max(Math.trunc(rowCount ?? defaultSampleRowCount), 0), maximumSampleRowCount);
    const effectiveSeed = (seed ?? defaultSampleSeed) >>> 0;
    const pool = sampleLocaleFor(locale);
    const rows: Record<string, unknown>[] = [];

    for (let index = 0; index < count; index++) {
        const random = new SampleRandom(rowSeed(effectiveSeed, shape.name, index));
        const row: Record<string, unknown> = {};
        for (const field of shape.fields) {
            const isNull = field.nullable === true && random.nextInt(5) === 0;
            const value = generateValue(field, inferSampleFieldKind(field), random, pool);
            row[field.name] = isNull ? null : value;
        }
        rows.push(row);
    }

    return rows;
}

function generateValue(field: SampleShapeField, kind: SampleFieldKind, random: SampleRandom, pool: SampleLocale): unknown {
    switch (kind) {
        case SampleFieldKind.Id:
            return generateId(random);
        case SampleFieldKind.Name:
            return `${random.pick(pool.firstNames)} ${random.pick(pool.lastNames)}`;
        case SampleFieldKind.Company:
            return random.pick(pool.companies);
        case SampleFieldKind.Email: {
            const first = random.pick(pool.firstNames);
            const last = random.pick(pool.lastNames);
            return `${slug(first)}.${slug(last)}@${random.pick(pool.domains)}`;
        }
        case SampleFieldKind.Phone:
            return [...pool.phoneTemplate].map(character => (character === '#' ? String(random.nextInt(10)) : character)).join('');
        case SampleFieldKind.City:
            return random.pick(pool.cities);
        case SampleFieldKind.Text: {
            const words = Array.from({ length: 3 + random.nextInt(4) }, () => random.pick(pool.words));
            return capitalize(words.join(' '));
        }
        case SampleFieldKind.WholeNumber: {
            const [low, high] = range(field.min, field.max, 0, 1000, Math.trunc);
            return low + random.nextInt(high - low + 1);
        }
        case SampleFieldKind.Amount: {
            const [low, high] = range(field.min, field.max, 10, 5000, value => Math.floor(value * 100 + 0.5));
            return (low + random.nextInt(high - low + 1)) / 100;
        }
        case SampleFieldKind.Boolean:
            return random.nextInt(2) === 1;
        case SampleFieldKind.Date:
            return formatDay(anchorDay + random.nextInt(dateSpanDays));
        case SampleFieldKind.DateTime: {
            const day = anchorDay + random.nextInt(dateSpanDays);
            const seconds = random.nextInt(86400);
            return `${formatDay(day)}T${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}Z`;
        }
        case SampleFieldKind.Enum:
            return field.enumValues !== undefined && field.enumValues !== null && field.enumValues.length > 0 ? random.pick(field.enumValues) : null;
        default:
            return null;
    }
}

function range(min: number | undefined, max: number | undefined, defaultMin: number, defaultMax: number, convert: (value: number) => number): [number, number] {
    const low = convert(min ?? defaultMin);
    const high = convert(max ?? defaultMax);
    return high < low ? [high, low] : [low, high];
}

function generateId(random: SampleRandom): string {
    const a = random.next();
    const b = ((random.next() & 0xFFFF0FFF) | 0x00004000) >>> 0;
    const c = ((random.next() & 0x3FFFFFFF) | 0x80000000) >>> 0;
    const d = random.next();
    return `${hex(a, 8)}-${hex(b >>> 16, 4)}-${hex(b & 0xFFFF, 4)}-${hex(c >>> 16, 4)}-${hex(c & 0xFFFF, 4)}${hex(d, 8)}`;
}

const transliterations = new Map<string, string>([['æ', 'ae'], ['ø', 'o'], ['å', 'a'], ['ä', 'a'], ['ö', 'o'], ['ü', 'u'], ['ß', 'ss'], ['é', 'e']]);

function slug(text: string): string {
    let result = '';
    for (const character of text.toLowerCase()) {
        const mapped = transliterations.get(character) ?? character;
        for (const part of mapped) {
            if ((part >= 'a' && part <= 'z') || (part >= '0' && part <= '9')) result += part;
        }
    }
    return result;
}

function capitalize(text: string): string {
    const first = text.charAt(0);
    return first >= 'a' && first <= 'z' ? first.toUpperCase() + text.slice(1) : text;
}

function hex(value: number, digits: number): string {
    return (value >>> 0).toString(16).padStart(digits, '0');
}

function pad(value: number): string {
    return value < 10 ? `0${value}` : String(value);
}

/** Formats days since 1970-01-01 as `yyyy-MM-dd` (Howard Hinnant's civil-from-days). */
function formatDay(days: number): string {
    const shifted = days + 719468;
    const era = Math.floor(shifted / 146097);
    const dayOfEra = shifted - era * 146097;
    const yearOfEra = Math.floor((dayOfEra - Math.floor(dayOfEra / 1460) + Math.floor(dayOfEra / 36524) - Math.floor(dayOfEra / 146096)) / 365);
    const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
    const monthPrime = Math.floor((5 * dayOfYear + 2) / 153);
    const day = dayOfYear - Math.floor((153 * monthPrime + 2) / 5) + 1;
    const month = monthPrime < 10 ? monthPrime + 3 : monthPrime - 9;
    const year = yearOfEra + era * 400 + (month <= 2 ? 1 : 0);
    return `${String(year).padStart(4, '0')}-${pad(month)}-${pad(day)}`;
}
