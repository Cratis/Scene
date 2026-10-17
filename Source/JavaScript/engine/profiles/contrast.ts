// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** How well white text reads on a colour. */
export enum ContrastGrade {
    /** At least 7:1. */
    Aaa = 'aaa',

    /** At least 4.5:1. */
    Aa = 'aa',

    /** At least 3:1: readable only as large text. */
    LargeTextOnly = 'largeTextOnly',

    /** Below 3:1. */
    Fails = 'fails',
}

export interface ContrastResult {
    valid: boolean;

    /** The contrast ratio against white, rounded to two decimals; absent when the colour is not valid. */
    ratio?: number;

    grade?: ContrastGrade;

    /** Why the colour is not valid. */
    message?: string;
}

/** The ratio an accent must reach against white button text. */
export const minimumAccentContrast = 3;

const invalid = 'Enter a 3- or 6-digit hex colour, like #0a7 or #00aa77';

/**
 * Measures the contrast of a colour against white. Accepts three- or six-digit hex colours, with or without the `#`; anything else is reported
 * with a message and changes nothing.
 *
 * @param color The colour.
 * @returns The ratio and its grade, or why the colour cannot be read.
 */
export function contrastAgainstWhite(color: string): ContrastResult {
    const match = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(color.trim());
    if (match === null) return { valid: false, message: invalid };

    const hex = match[1].length === 3 ? match[1].split('').map(digit => digit + digit).join('') : match[1];
    const channels = [0, 2, 4].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
    const [red, green, blue] = channels.map(value => (value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4)));
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    const ratio = Math.round((1.05 / (luminance + 0.05)) * 100) / 100;
    const grade = ratio >= 7 ? ContrastGrade.Aaa : ratio >= 4.5 ? ContrastGrade.Aa : ratio >= minimumAccentContrast ? ContrastGrade.LargeTextOnly : ContrastGrade.Fails;
    return { valid: true, ratio, grade };
}
