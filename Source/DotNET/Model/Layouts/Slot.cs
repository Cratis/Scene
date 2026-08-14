// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Model.Layouts;

/// <summary>
/// A named placeholder within a <see cref="Layout"/>, filled with content by a screen and positioned by
/// its <see cref="Arrangement"/>. A layout is not uniformly one arrangement mode — <c>flow</c> for most
/// slots and <c>freeform</c> for one is a valid combination.
/// </summary>
/// <param name="Name">The slot's name, unique within its layout.</param>
/// <param name="Arrangement">How the slot is arranged, or <see langword="null"/> for the layout's default arrangement.</param>
public record Slot(string Name, Arrangement? Arrangement = null);
