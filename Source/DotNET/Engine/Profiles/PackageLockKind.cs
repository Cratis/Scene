// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

namespace Cratis.Scene.Engine.Profiles;

/// <summary>
/// Why a package cannot be removed.
/// </summary>
public enum PackageLockKind
{
    /// <summary>
    /// <c language="csharp">core</c> can never be removed or moved.
    /// </summary>
    Core = 0,

    /// <summary>
    /// Another listed package needs it.
    /// </summary>
    NeededBy = 1,

    /// <summary>
    /// It is the blueprint of the current shell.
    /// </summary>
    Shell = 2
}
