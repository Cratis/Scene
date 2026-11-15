// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** One place a screen navigates to another: an element's destination property. */
export interface ScreenLink {
    from: string;
    element: string;
    prop: string;
    to: string;
}

export const ScreenLinkPropertyNames: (keyof ScreenLink)[] = ['from', 'element', 'prop', 'to'];
