// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Packages;

/// <summary>
/// What a <see cref="ScenePackage"/> contributes to a <see cref="Profiles.UiProfile"/>. A profile's package
/// list mixes all three kinds freely - the kind says what a package is for, never where it sits in the
/// override-priority order.
/// </summary>
public enum PackageKind
{
    /// <summary>
    /// Declares component names a screen can resolve against. A package with no dependency on another
    /// <see cref="ComponentLibrary"/> is a base library (PrimeReact, <c>core</c>); one that depends on
    /// another layers on top of it.
    /// </summary>
    ComponentLibrary = 0,

    /// <summary>
    /// Contributes styling rather than components - a utility CSS system such as Tailwind. A styling
    /// package usually declares no components at all; component libraries depend on it to say "my
    /// components are written against this styling system".
    /// </summary>
    Styling = 1,

    /// <summary>
    /// Provides ready-made <see cref="Layouts.Layout"/>s and the shell components that fill their slots.
    /// A layout package depends on the component libraries its shell is built from.
    /// </summary>
    Layout = 2
}
