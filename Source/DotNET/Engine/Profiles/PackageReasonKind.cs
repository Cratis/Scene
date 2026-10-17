// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Why a package is in the list.
/// </summary>
public enum PackageReasonKind
{
    /// <summary>
    /// The author added it, or a theme or blueprint choice added it on the author's behalf.
    /// </summary>
    Chosen = 0,

    /// <summary>
    /// Another listed package depends on it.
    /// </summary>
    NeededBy = 1,

    /// <summary>
    /// It is the blueprint of the current shell.
    /// </summary>
    UsedByShell = 2,

    /// <summary>
    /// It is <c language="csharp">core</c>: the final fallback, always last.
    /// </summary>
    AlwaysLast = 3
}
