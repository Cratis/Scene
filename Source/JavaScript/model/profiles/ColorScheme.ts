// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/** Which colour scheme an application presents: always light, always dark, or following the viewer's system preference. */
export enum ColorScheme {
    /** Always the light variant of the theme. */
    Light = 'Light',
    /** Always the dark variant of the theme. */
    Dark = 'Dark',
    /** Follow the viewer's operating-system preference. */
    System = 'System',
}
