// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * Represents a width and height. Either dimension left unspecified means the renderer decides.
 */
export interface Size {
    width?: number;
    height?: number;
}

export const SizePropertyNames: (keyof Size)[] = ['width', 'height'];
