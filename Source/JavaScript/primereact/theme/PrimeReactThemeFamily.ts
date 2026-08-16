// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * The `@primeuix/themes` preset families a PrimeReact 11 theme can be built on.
 *
 * PrimeReact 10 had no concept like this: a theme was a folder name and a compiled stylesheet, and the
 * family it belonged to was a naming convention rather than anything the code could act on. In v11 the
 * family is the actual unit of design - a JavaScript preset object supplied to `PrimeReactProvider` -
 * and a Scene theme is that preset plus an accent color. Making it an enum rather than a string means a
 * theme cannot name a family that does not exist, and `primeReactThemePreset` gets an exhaustive
 * `switch` the compiler checks when PrimeTek adds a fifth family.
 */
export enum PrimeReactThemeFamily {
    /**
     * Aura - PrimeTek's flagship design language for v11, and the one their own documentation defaults
     * to. Softer radii and a lower-contrast surface ramp than Lara.
     */
    Aura = 'aura',

    /**
     * Lara - the family Scene shipped throughout PrimeReact 10. Carried forward so an application
     * upgrading from v10 can keep a recognisably similar look.
     */
    Lara = 'lara',

    /**
     * Nora - tighter spacing, squarer corners and heavier borders. The most compact of the four.
     */
    Nora = 'nora',

    /**
     * Material - PrimeTek's reading of Material Design, and the nearest thing v11 has to the v10
     * `md-*` and `mdc-*` themes.
     */
    Material = 'material',
}
