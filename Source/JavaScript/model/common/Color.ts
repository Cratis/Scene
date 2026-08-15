// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Represents a color as four channels, independent of any specific rendering platform's color type.
 */
export interface Color {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}

export const ColorPropertyNames: (keyof Color)[] = ['red', 'green', 'blue', 'alpha'];
