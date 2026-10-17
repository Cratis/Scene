// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Where a font's files come from.
/// </summary>
public enum FontSource
{
    /// <summary>
    /// Shipped with the application itself.
    /// </summary>
    Bundled = 0,

    /// <summary>
    /// Loaded from a font host by the stylesheet in <see cref="FontChoice.Stylesheet"/>.
    /// </summary>
    Hosted = 1,

    /// <summary>
    /// Already on the user's system; nothing is loaded.
    /// </summary>
    System = 2
}
