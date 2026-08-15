// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Represents a uniform or per-edge thickness, used for margins and padding.
 */
export interface Thickness {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export const ThicknessPropertyNames: (keyof Thickness)[] = ['left', 'top', 'right', 'bottom'];
