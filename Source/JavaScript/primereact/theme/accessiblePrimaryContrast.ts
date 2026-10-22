// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

function luminance(hex: string): number {
    const [red, green, blue] = [1, 3, 5].map(start => {
        const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

// Catalog colors are resolved six-digit hex values. Keep the preset's foreground whenever it meets
// normal-text AA; primary fills also carry small tag text and progress percentages, not just buttons.
export function accessiblePrimaryContrast(background: string, foreground: string): string {
    const fill = luminance(background);
    const text = luminance(foreground);
    const ratio = (Math.max(fill, text) + 0.05) / (Math.min(fill, text) + 0.05);
    if (ratio >= 4.5) return foreground;

    return 1.05 / (fill + 0.05) >= (fill + 0.05) / 0.05 ? '#ffffff' : '#000000';
}
