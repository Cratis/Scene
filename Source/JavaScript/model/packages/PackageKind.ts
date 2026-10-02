// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

/**
 * What a {@link ScenePackage} contributes to a {@link UiProfile}. A profile's package list mixes all
 * four kinds freely - the kind says what a package is for, never where it sits in the override-priority
 * order.
 */
export enum PackageKind {
    /**
     * Declares component names a screen can resolve against. A package with no dependency on another
     * `ComponentLibrary` is a base library (PrimeReact, `core`); one that depends on another layers on
     * top of it.
     */
    ComponentLibrary = 'ComponentLibrary',

    /**
     * Contributes styling rather than components - a utility CSS system such as Tailwind. A styling
     * package usually declares no components at all; component libraries depend on it to say "my
     * components are written against this styling system".
     */
    Styling = 'Styling',

    /**
     * Provides the shape of an application: its {@link Layout}s, the {@link ScreenTemplate}s and
     * {@link DialogTemplate}s built on them, and the components that fill their slots. An application
     * selects one blueprint, and gets a coherent set rather than assembling layouts and templates from
     * unrelated sources.
     *
     * A blueprint depends on the component libraries it is built from — the default blueprint is written
     * against PrimeReact and Cratis Components, and says so. That is what makes "which blueprints can I
     * use" answerable from the packages a profile already has.
     */
    Blueprint = 'Blueprint',

    /**
     * Provides icons - a named, versioned library of them, such as Lucide or PrimeIcons - that screens,
     * templates and blueprints refer to by {@link IconReference} rather than by CSS class or markup.
     * A library declares its variants, renderer adapters and attribution through
     * {@link ScenePackage.iconLibrary}; its icon catalog is loaded on demand, never listed in the package.
     *
     * It is a package kind rather than a contribution on another kind because everything an author asks
     * of a library - select it in a profile, see its license and version, have it pulled in by the
     * components that need it - is already what a package is. Several libraries coexist in one profile,
     * and the library is part of every icon's identity, so same-named icons never shadow one another.
     */
    IconLibrary = 'IconLibrary',
}
