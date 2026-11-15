// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// The accent as the profile stores it: `#rrggbb` in lower case, or empty for the theme's own accent. A short `#rgb` is widened; anything that is
// not a colour clears the accent rather than storing something the theme cannot apply.
export function normalizeAccent(value: unknown): string {
    if (typeof value !== 'string') return '';
    const text = value.trim().toLowerCase();
    if (/^#[0-9a-f]{6}$/.test(text)) return text;
    const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/.exec(text);
    return short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : '';
}
